import RPi.GPIO as GPIO
import time
import os
import subprocess
import requests
import json

#ip_hotspot: 192.168.137.1

# Pini
TRIG1 = 23
ECHO1 = 24
TRIG2 = 5
ECHO2 = 6
TRIG3 = 9
ECHO3 = 11
TRIG4 = 25
ECHO4 = 8
TRIG5 = 7
ECHO5 = 12
CAMERA_SERVO = 18
BARRIER_SERVO = 10

GPIO.setmode(GPIO.BCM)
GPIO.setup(TRIG1, GPIO.OUT)
GPIO.setup(ECHO1, GPIO.IN)
GPIO.setup(TRIG2, GPIO.OUT)
GPIO.setup(ECHO2, GPIO.IN)
GPIO.setup(TRIG3, GPIO.OUT)
GPIO.setup(ECHO3, GPIO.IN)
GPIO.setup(TRIG4, GPIO.OUT)
GPIO.setup(ECHO4, GPIO.IN)
GPIO.setup(TRIG5, GPIO.OUT)
GPIO.setup(ECHO5, GPIO.IN)
GPIO.setup(CAMERA_SERVO, GPIO.OUT)
GPIO.setup(BARRIER_SERVO, GPIO.OUT)

camera_pwm = GPIO.PWM(CAMERA_SERVO, 50)
camera_pwm.start(0)

barrier_pwm = GPIO.PWM(BARRIER_SERVO, 50)
barrier_pwm.start(0)

spot_a1_ocupat = False
spot_a2_ocupat = False
spot_a3_ocupat = False


#functie folosita pentru a seta unghiul
def set_servo_angle(pwm, angle):
    duty = 2.5 + (angle / 180.0) * 10
    pwm.ChangeDutyCycle(duty)
    time.sleep(0.3)
    pwm.ChangeDutyCycle(0)

#functie folosita pentru rotirea servomotoarelor
def rotate_slow(pwm, from_angle, to_angle, delay=0.001):
    step = 1 if to_angle > from_angle else -1
    for angle in range(from_angle, to_angle + step, step * 10):
        set_servo_angle(pwm, angle)
        time.sleep(delay)

#se masoara si se calculeaza distanta pentru senzorii ultrasonici
def measure_distance(trig, echo):
    GPIO.output(trig, False)
    time.sleep(0.05)
    GPIO.output(trig, True)
    time.sleep(0.00001)
    GPIO.output(trig, False)

    while GPIO.input(echo) == 0:
        pulse_start = time.time()
    while GPIO.input(echo) == 1:
        pulse_end = time.time()

    pulse_duration = pulse_end - pulse_start
    distance = pulse_duration * 34300 / 2
    return round(distance, 2)

#se foloseste pentru a fotografia placutele de inmatriculare
def capture_image(filename="poza.jpg"):
    cmd = f"libcamera-jpeg -o {filename} --width 1920 --height 1080 --timeout 10"
    os.system(cmd)

#se proceseaza detectarea numarului de inmatriculare
def run_alpr(filename="poza.jpg"):
    cmd = ["alpr", "-c", "eu", filename]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, text=True)
    return result.stdout

#se extrage numarul de inmatriculare din raspunsul primit de la OpenALPR
def extrage_numar(alpr_output):
    lines = alpr_output.splitlines()
    for line in lines:
        if "-" in line and "\t" in line:
            parts = line.strip().split("\t")
            return parts[0].replace("-", "").strip()
    return None

def actioneaza_bariera():
    print(">> Se ridica bariera...")
    rotate_slow(barrier_pwm, 70, 0, delay=0.003)
    time.sleep(5)
    print("Se coboara bariera...")
    rotate_slow(barrier_pwm, 0, 79, delay=0.003)

def verifica_rezervare(plate_number):
    verify_url = f"http://192.168.0.101:8080/api/v1/reservation/verifyreservation/{plate_number}"
    try:
        response = requests.get(verify_url)
        print(f"Raspuns server ({verify_url}): {response.status_code} - {response.text.strip()}")

        if response.status_code == 200 and response.text and response.text != "null":
            data = json.loads(response.text)
            if "expired" in data and data["expired"] == False:
                print("Rezervarea este valabila. Se ridica bariera.")
                actioneaza_bariera()

                reservation_id = data.get("id")
                if reservation_id:
                    update_url = f"http://192.168.0.101:8080/api/v1/reservation/update/{reservation_id}"
                    requests.put(update_url, json=data)
                    print(f"Rezervare actualizata: {update_url}")

            elif data.get("expired") == True:
                if data.get("entryTime") != 0 and data.get("leftTime") == 0:
                    reservation_id = data.get("id")
                    if reservation_id:
                        update_url = f"http://192.168.0.101:8080/api/v1/reservation/update/{reservation_id}"
                        requests.put(update_url, json=data)
                        print(f"Rezervare actualizata dupa validare: {update_url}")
                else:
                    print("Rezervarea este expirata și nu indeplineste conditiile")
            else:
                print("Acest autovehicul nu are o rezervare activa!")
        else:
            print("Acest autovehicul nu are o rezervare activa!")

    except Exception as e:
        print(f"Eroare la conectarea cu serverul: {e}")

def anunta_plecare(plate_number):
    try:
	#se anunta finalizarea rezervarii
        url = f"http://192.168.0.101:8080/api/v1/reservation/left/{plate_number}"
        response = requests.put(url)

        print(f"Cerere plecare trimisă: {response.status_code} - {response.text.strip()}")
        actioneaza_bariera()
	#se inregistreaza masina respectiva in baza de date
        if response.status_code == 200 and response.text and response.text != "null":
            data = json.loads(response.text)
            car_payload = {
                "licensePlate": data.get("licensePlate"),
                "joinTime": data.get("entryTime")/1000,
                "leftTime": data.get("leftTime")/1000,
                "ownerName": f"{data['user']['firstname']} {data['user']['lastname']}"
            }
            car_url = "http://192.168.0.101:8080/api/v1/cars/add"
            car_response = requests.post(car_url, json=car_payload)
            print(f"Salvare masina: {car_response.status_code} - {car_response.text.strip()}")

    except Exception as e:
        print(f"Eroare la notificarea plecarii: {e}")

#se reseteaza locurile la pornirea programului
def reset_all_spots():
    spot_names = ["A1", "A2", "A3"]  # Adaugă aici toate locurile existente
    for name in spot_names:
        try:
            response = requests.put(
                "http://192.168.0.101:8080/api/v1/parkingspot/updatespotstatus",
                json={"name": name, "isUsed": False}
            )
            print(f"Resetat {name} la false: {response.status_code}")
        except Exception as e:
            print(f"Eroare la resetarea locului {name}: {e}")
    print("S-au resetat locurile")

try:
    reset_all_spots()
    set_servo_angle(barrier_pwm, 75)
    set_servo_angle(camera_pwm, 110)  # rotire inițială cameră
    current_angle = 110
    obstacol_1_detectat = False
    obstacol_2_detectat = False

    while True:
        dist1 = measure_distance(TRIG1, ECHO1)
        dist2 = measure_distance(TRIG2, ECHO2)
        dist3 = measure_distance(TRIG3, ECHO3)
        dist4 = measure_distance(TRIG4, ECHO4)
        dist5 = measure_distance(TRIG5, ECHO5)

        #print(f"[Senzor 1] Distanța: {dist1} cm")
        #print(f"[Senzor 2] Distanța: {dist2} cm")
        #print(f"[Senzor 3] Distanța: {dist3} cm")
        #print(f"[Senzor 4] Distanța: {dist4} cm")
        #print(f"[Senzor 5] Distanța: {dist5} cm")


        # Loc A1 ocupat
        if dist3 < 5 and not spot_a1_ocupat:
            try:
                requests.put(
                    "http://192.168.0.101:8080/api/v1/parkingspot/updatespotstatus",
                    json={"name": "A1", "isUsed": True}
                )
                print("Locul A1 ocupat. Trimis isUsed=true.")
                spot_a1_ocupat = True
            except Exception as e:
                print(f"Eroare PUT ocupare A1: {e}")

        elif dist3 >= 5 and spot_a1_ocupat:
            try:
                requests.put(
                    "http://192.168.0.101:8080/api/v1/parkingspot/updatespotstatus",
                    json={"name": "A1", "isUsed": False}
                )
                print("Locul A1 eliberat. Trimis isUsed=false.")
                spot_a1_ocupat = False
            except Exception as e:
                print(f"Eroare PUT eliberare A1: {e}")
        # Loc A2 ocupat
        if dist4 < 5 and not spot_a2_ocupat:
            try:
                requests.put(
                    "http://192.168.0.101:8080/api/v1/parkingspot/updatespotstatus",
                    json={"name": "A2", "isUsed": True}
                )
                print("Locul A2 ocupat. Trimis isUsed=true.")
                spot_a2_ocupat = True
            except Exception as e:
                print(f"Eroare PUT ocupare A2: {e}")

        elif dist4 >= 5 and spot_a2_ocupat:
            try:
                requests.put(
                    "http://192.168.0.101:8080/api/v1/parkingspot/updatespotstatus",
                    json={"name": "A2", "isUsed": False}
                )
                print("Locul A2 eliberat. Trimis isUsed=false.")
                spot_a2_ocupat = False
            except Exception as e:
                print(f"Eroare PUT eliberare A2: {e}")
         
        if dist5 < 5 and not spot_a3_ocupat:
            try:
                requests.put("http://192.168.0.101:8080/api/v1/parkingspot/updatespotstatus", json={"name": "A3", "isUsed": True})
                print("Locul A3 ocupat.")
                spot_a3_ocupat = True
            except Exception as e:
                print(f"Eroare PUT ocupare A3: {e}")
        elif dist5 >= 5 and spot_a3_ocupat:
            try:
                requests.put("http://192.168.0.101:8080/api/v1/parkingspot/updatespotstatus", json={"name": "A3", "isUsed": False})
                print("Locul A3 eliberat.")
                spot_a3_ocupat = False
            except Exception as e:
                print(f"Eroare PUT eliberare A3: {e}")

        if dist1 < 10 and not obstacol_1_detectat:
            print("Senzor 1 (Intrare): Se roteste camera la 110°...")
            rotate_slow(camera_pwm, current_angle, 110, delay=0.005)
            current_angle = 110

            print("Capturare imagine...")
            capture_image("imagine_intrare.jpg")

            print("Analiza OpenALPR...")
            result = run_alpr("imagine_intrare.jpg")
            print("Rezultat ALPR complet:")
            print(result)

            plate_number = extrage_numar(result)
            if plate_number:
                print(f"Numar detectat: {plate_number}")
                verifica_rezervare(plate_number)
            else:
                print("Nu s-a detectat niciun numar")

            obstacol_1_detectat = True

        elif dist1 >= 10 and obstacol_1_detectat:
            obstacol_1_detectat = False

        if dist2 < 10 and not obstacol_2_detectat:
            print("Senzor 2 (Iesire): Se roteste camera la 10°...")
            rotate_slow(camera_pwm, current_angle, 10, delay=0.005)
            current_angle = 10

            print("Capturare imagine...")
            capture_image("imagine_iesire.jpg")

            print("Analiza OpenALPR...")
            result = run_alpr("imagine_iesire.jpg")
            print("Rezultat ALPR complet:")
            print(result)

            plate_number = extrage_numar(result)
            if plate_number:
                print(f"Numar detectat: {plate_number}")
                anunta_plecare(plate_number)
            else:
                print("Nu s-a detectat niciun numar de inmatriculare")

            obstacol_2_detectat = True

        elif dist2 >= 10 and obstacol_2_detectat:
            obstacol_2_detectat = False

        time.sleep(1)

except KeyboardInterrupt:
    print("Oprit manual.")
    camera_pwm.stop()
    barrier_pwm.stop()
    GPIO.cleanup()
