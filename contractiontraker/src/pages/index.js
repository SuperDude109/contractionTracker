import {useEffect, useState} from 'react';

export default function Home() {
    const [message, setMessage] = useState('');
    const [contractionsList, setContractionsList] = useState([]);
    const [timeSinceLastContraction, setTimeSinceLastContraction] = useState(null);
    const [averageTimeBetweenLastHour, setAverageTimeBetweenLastHour] = useState(0);
    const [averageTimeBetweenLastTwoHours, setAverageTimeBetweenLastTwoHours] = useState(0);

    const fetchContractions = async () => {
        try {
            const response = await fetch('/api/contractions');
            if (response.ok) {
                const data = await response.json();
                setContractionsList(data.contractionsList);
                setTimeSinceLastContraction(data.contractionsList[data.contractionsList.length - 1].timeSinceLast);
                setAverageTimeBetweenLastHour(data.averageTimeBetweenLastHour / 1000);
                setAverageTimeBetweenLastTwoHours(data.averageTimeBetweenLastTwoHours / 1000);
            }
        } catch (error) {
            setMessage('Failed to fetch contractions data');
        }
    };

    useEffect(() => {
        fetchContractions();
    }, []);

    const handleContraction = async () => {
        const confirmLog = window.confirm("Are you sure you want to log this contraction?");
        if (!confirmLog) return;

        try {
            const response = await fetch('/api/contractions', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({action: 'start'}),
            });

            if (response.ok) {
                setMessage('Contraction recorded.');
                fetchContractions();
            } else {
                const errorData = await response.json();
                setMessage(errorData.error || 'An error occurred');
            }
        } catch (error) {
            setMessage('Failed to communicate with the server');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins} minutes and ${secs} seconds`;
    };

    return (<>
        {message && <p>{message}</p>}
        <p>Time since last
            contraction: {timeSinceLastContraction ? formatTime(timeSinceLastContraction) : 'N/A'}</p>
        <p>Average time between contractions in last hour: {formatTime(averageTimeBetweenLastHour)}</p>
        <p>Average time between contractions in last two hours: {formatTime(averageTimeBetweenLastTwoHours)}</p>
        <div style={{maxHeight: '200px', overflowY: 'scroll'}}>
            <h3>Contractions List:</h3>
            <ul>
                {contractionsList.slice(0).reverse().map(contraction => (<li key={contraction.id}>
                    Started at: {new Date(contraction.startTime).toLocaleTimeString()}
                    {contraction.timeSinceLast && <> | Time since
                        last: {formatTime(contraction.timeSinceLast)}</>}
                </li>))}
            </ul>
        </div>
    </>);
}
