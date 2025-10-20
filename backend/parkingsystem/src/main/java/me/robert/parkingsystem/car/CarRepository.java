package me.robert.parkingsystem.car;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, Long> {
    Optional<List<Car>> findByLicensePlate(String licensePlate);

    @Query("SELECT COUNT(c) FROM Car c")
    int countAllParkedCars();

    @Query(value = "SELECT COUNT(*) FROM cars WHERE MONTH(FROM_UNIXTIME(join_time)) = MONTH(CURDATE())", nativeQuery = true)
    int countThisMonthParkedCars();

    @Query(value = "SELECT COUNT(*) FROM cars WHERE DAY(FROM_UNIXTIME(join_time)) = DAY(CURDATE())", nativeQuery = true)
    int countTodayParkedCars();

    @Query(nativeQuery = true, value = """
    SELECT 
        MONTHNAME(FROM_UNIXTIME(join_time)) as month,
        COUNT(*) as count
    FROM cars
    WHERE YEAR(FROM_UNIXTIME(join_time))= YEAR(CURDATE())
    GROUP BY MONTH(FROM_UNIXTIME(join_time)), MONTHNAME(FROM_UNIXTIME(join_time))
    ORDER BY MONTH(FROM_UNIXTIME(join_time))
    """)
    List<Map<String, Object>> findMonthlyStatsThisYear();

    @Query(nativeQuery = true, value = """
    SELECT 
        DAYOFMONTH(FROM_UNIXTIME(join_time)) as day,
        COUNT(*) as count
    FROM cars
    WHERE 
        YEAR(FROM_UNIXTIME(join_time)) = YEAR(CURDATE()) AND
        MONTH(FROM_UNIXTIME(join_time)) = MONTH(CURDATE()) AND
        DAY(FROM_UNIXTIME(join_time)) <= DAY(CURDATE())
    GROUP BY DAY(FROM_UNIXTIME(join_time))
    ORDER BY day
    """)
    List<Map<Integer, Object>> findDaysThisMonth();

    @Query(nativeQuery = true, value = """

    SELECT
    CASE DAYOFWEEK(FROM_UNIXTIME(join_time))
        WHEN 2 THEN 'Luni'
        WHEN 3 THEN 'Marti'
        WHEN 4 THEN 'Miercuri'
        WHEN 5 THEN 'Joi'
        WHEN 6 THEN 'Vineri'
        WHEN 7 THEN 'Sambata'
        WHEN 1 THEN 'Duminica'
    END AS day_name,
    COUNT(*) AS count,
    CASE DAYOFWEEK(FROM_UNIXTIME(join_time))
        WHEN 1 THEN 7  
        ELSE DAYOFWEEK(FROM_UNIXTIME(join_time)) - 1 
    END AS day_order
            FROM cars
            WHERE
    YEARWEEK(FROM_UNIXTIME(join_time), 1) = YEARWEEK(CURDATE(), 1)
            GROUP BY
    day_name, day_order
            ORDER BY
    day_order
    """)
    List<Map<String, Object>> findDaysOfWeek();
}
