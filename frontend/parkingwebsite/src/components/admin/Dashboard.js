import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import Navbar from './Navbar';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import './DashboardStyle.css';

ChartJS.register(...registerables);

const Dashboard = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [stats, setStats] = useState({
        total: 0,
        month: 0,
        today: 0,
        loading: true,
        error: null
    });
    const [yearlyData, setYearlyData] = useState({
        loading: true,
        error: null,
        data: null
    });
    const [monthlyData, setMonthlyData] = useState({
        loading: true,
        error: null,
        data: null
    });
    const [weeklyData, setWeeklyData] = useState({
        loading: true,
        error: null,
        data: null
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
            
                const [statsResponse, yearlyResponse, monthlyResponse, weeklyResponse] = await Promise.all([
                    fetch('http://localhost:8080/api/v1/cars/statistic_total'),
                    fetch('http://localhost:8080/api/v1/cars/statistic_year'),
                    fetch('http://localhost:8080/api/v1/cars/statistic_month'),
                    fetch('http://localhost:8080/api/v1/cars/statistic_week')
                ]);

                if (!statsResponse.ok) throw new Error('Nu am putut încărca statisticile totale');
                if (!yearlyResponse.ok) throw new Error('Nu am putut încărca statisticile anuale');
                if (!monthlyResponse.ok) throw new Error('Nu am putut încărca statisticile lunare');
                if (!weeklyResponse.ok) throw new Error('Nu am putut încărca statisticile săptămânale');

                const [statsData, yearlyData, monthlyData, weeklyData] = await Promise.all([
                    statsResponse.json(),
                    yearlyResponse.json(),
                    monthlyResponse.json(),
                    weeklyResponse.json()
                ]);

                setStats({
                    total: statsData.total || 0,
                    month: statsData.month || 0,
                    today: statsData.today || 0,
                    loading: false,
                    error: null
                });

                setYearlyData({
                    loading: false,
                    error: null,
                    data: yearlyData
                });

                setMonthlyData({
                    loading: false,
                    error: null,
                    data: monthlyData
                });

                setWeeklyData({
                    loading: false,
                    error: null,
                    data: weeklyData
                });

            } catch (error) {
                setStats(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message
                }));
                setYearlyData(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message
                }));
                setMonthlyData(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message
                }));
                setWeeklyData(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message
                }));
            }
        };

        fetchStats();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };


    const getYearlyChartData = () => {
        if (yearlyData.loading || !yearlyData.data) {
            return {
                labels: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'],
                datasets: [{
                    label: 'Mașini parcate',
                    data: Array(12).fill(0),
                    backgroundColor: 'rgba(38, 100, 142, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            };
        }

        const monthMap = {
            'January': 'Ian', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr',
            'May': 'Mai', 'June': 'Iun', 'July': 'Iul', 'August': 'Aug',
            'September': 'Sep', 'October': 'Oct', 'November': 'Noi', 'December': 'Dec'
        };

        const labels = Object.keys(yearlyData.data).map(month => monthMap[month] || month);
        const data = Object.values(yearlyData.data);

        return {
            labels,
            datasets: [{
                label: 'Mașini parcate',
                data,
                backgroundColor: 'rgba(38, 100, 142, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
    };

    const getMonthlyChartData = () => {
        if (monthlyData.loading || !monthlyData.data) {
            return {
                labels: Array.from({length: 31}, (_, i) => `${i+1}`),
                datasets: [{
                    label: 'Mașini/zi',
                    data: Array(31).fill(0),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            };
        }

        return {
            labels: Object.keys(monthlyData.data),
            datasets: [{
                label: 'Mașini/zi',
                data: Object.values(monthlyData.data),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };
    };

    const getWeeklyChartData = () => {
        if (weeklyData.loading || !weeklyData.data) {
            return {
                labels: ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata', 'Duminica'],
                datasets: [{
                    label: 'Mașini/zi',
                    data: Array(7).fill(0),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            };
        }

        const dayOrder = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata', 'Duminica'];
        const data = dayOrder.map(day => weeklyData.data[day] || 0);

        return {
            labels: dayOrder,
            datasets: [{
                label: 'Mașini/zi',
                data,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };
    };

    const calculateWeeklyTotal = () => {
        if (weeklyData.loading || !weeklyData.data) return 0;
        return Object.values(weeklyData.data).reduce((sum, count) => sum + (count || 0), 0);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('ro-RO').format(num);
    };

    return (
        <div className="d-flex vh-100">
            <Navbar />
            
            <div className="flex-grow-1 p-4">
                <h2>Dashboard</h2>
                <p>Bun venit în panoul de administrare!</p>
                
                {(stats.error || yearlyData.error || monthlyData.error || weeklyData.error) && (
                    <div className="alert alert-danger">
                        {stats.error || yearlyData.error || monthlyData.error || weeklyData.error}
                    </div>
                )}

                <div className="mt-4">
                    <h3>Statistici</h3>
                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="card chart-card">
                                <div className="card-body">
                                    <h5 className="card-title">Total mașini parcate</h5>
                                    <p className="card-text display-4">
                                        {stats.loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                        ) : (
                                            formatNumber(stats.total)
                                        )}
                                    </p>
                                    <div className="chart-container">
                                        {yearlyData.loading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Se încarcă...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Bar 
                                                data={getYearlyChartData()}
                                                options={{
                                                    responsive: true,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (context) => `${context.parsed.y} mașini`
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card chart-card">
                                <div className="card-body">
                                    <h5 className="card-title">Mașini parcate luna asta</h5>
                                    <p className="card-text display-4">
                                        {stats.loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                        ) : (
                                            formatNumber(stats.month)
                                        )}
                                    </p>
                                    <div className="chart-container">
                                        {monthlyData.loading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Se încarcă...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Line 
                                                data={getMonthlyChartData()}
                                                options={{
                                                    responsive: true,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (context) => `${context.parsed.y} mașini`
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card chart-card">
                                <div className="card-body">
                                    <h5 className="card-title">Mașini parcate săptămâna asta</h5>
                                    <p className="card-text display-4">
                                        {stats.loading || weeklyData.loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                        ) : (
                                            formatNumber(calculateWeeklyTotal())
                                        )}
                                    </p>
                                    <div className="chart-container">
                                        {weeklyData.loading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Se încarcă...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Bar 
                                                data={getWeeklyChartData()}
                                                options={{
                                                    responsive: true,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (context) => `${context.parsed.y} mașini`
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;