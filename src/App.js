import React, { useState, useMemo } from "react";

const settings = {
    api: {
        url: "http://66.151.33.22:9000/api/location",
        urlSensors: "http://66.151.33.22:9000/api/sensors/set-coordinates",
        urlSave: "http://66.151.33.22:9000/api/location",
        urlDelete: "http://66.151.33.22:9000/api/location/reset-saved",
        objectId: "5f0f2e36-d1a6-4f1e-95a4-167f0e14e07c",
    },
    titleRadio: "Таблицы",
    titleInput: "Фильтр даты",
    titleList: "Измерения",
    titleButtons: "Обновление данных",
    titleExperiment: "Эксперимент",
    inputDate: [
        { id: "date_from", desc: "Дата от" },
        { id: "date_to", desc: "Дата до" }
    ],
    units: "см"
}

function MenuDateInput({ title, inputDate, onChange }) {

    return(
        <div>
            {/*
            <fieldset className="menu-fieldset">
                <legend>{title}</legend>

                {inputDate.map((date) => (
                    <div key={date.id} className="menu-input">
                        <label htmlFor={date.id}>{date.desc}</label>
                        <input type="datetime-local" step="1" id={date.id} onChange={(e) => onChange(date.id, e.target.value)}/>
                    </div>
                ))}
            </fieldset>
            */}
        </div>
    );    
}

function MenuButtons({ title, buttons, isExperimentEnded }) {

    const allowedButtons = useMemo(() => ["Таблицы БД", "Новый эксперимент"], []);

    return(
        <fieldset className="menu-fieldset">
            <legend>{title}</legend>

            {buttons.map((btn, index) => {
                const isDisabled = isExperimentEnded && !allowedButtons.includes(btn.title);
                return (
                    <div className="menu-db" key={index}>
                        <button type="button" onClick={btn.onClick} disabled={isDisabled}>
                            {btn.title}
                        </button>
                    </div>
                );
            })}

        </fieldset>
    );
}

function MenuFilter({ openModal, onInputDate, fetchData, savePoint, deletePoints, buildRoad, isExperimentEnded }) {

    return(
        <div>
            <MenuButtons
                title={settings.titleRadio}
                buttons={[
                    { title: "Таблицы БД", onClick: () => openModal("tables") },
                    { title: "Обновить датчики", onClick: () => openModal("sensors")},
                ]}
                isExperimentEnded={isExperimentEnded}
            />
            <MenuDateInput
                title={settings.titleInput}
                inputDate={settings.inputDate}
                onChange={onInputDate}
            />
            <MenuButtons
                title={settings.titleButtons}
                buttons={[
                    { title: "Провести измерение", onClick: fetchData }, 
                    { title: "Сохранить измерение", onClick: savePoint }
                ]}
                isExperimentEnded={isExperimentEnded}
            />
            <MenuButtons
                title={settings.titleExperiment}
                buttons={[
                    { title: "Новый эксперимент", onClick: deletePoints }, 
                    { title: "Завершить эксперимент", onClick: buildRoad }
                ]}
                isExperimentEnded={isExperimentEnded}
            />
        </div>
    );    
}

function MenuElement({ index, point, active, onClick }) {
    const dateTime = new Date(point?.timestamp * 1000 - new Date().getTimezoneOffset() * 60000);
    const [date, time] = dateTime?.toISOString().split("T");

    return(
        <div 
            className={`menu-list__element ${active ? "active" : ""}`} 
            onClick={onClick}
        >
            <div>{index + 1}. {point.x} {settings.units}, {point.y} {settings.units}</div>
            <div>Дата: {date}</div>
            <div>Время: {time.split(".")[0]}</div>
        </div>
    ); 
}

function MenuList({ title, points, activeIndexes, toggleActive, haveSaved }) {

    return(
        <fieldset className="menu-fieldset menu-fieldset__points">
            <legend>{title}</legend>
            <div className="menu-list">
                {(points?.length === 0) ? 
                    <div>Измерения отсутствуют</div> :
                    points?.map((point, index) => (
                        <React.Fragment key={index}>
                            <MenuElement 
                                index={index}
                                point={point} 
                                active={activeIndexes.includes(index)} 
                                onClick={() => toggleActive(index)}
                            />
                            {index === 0 && haveSaved && (
                                <div>Сохранённые Измерения</div>
                            )}
                        </React.Fragment>
                    ))}
            </div>
        </fieldset>
    ); 
}

function SidebarMenu({ 
    isMenuOpen, setIsMenuOpen, points, activeIndexes, toggleActive, openModal, onInputDate,
    fetchData, savePoint, deletePoints, buildRoad, haveSaved, isExperimentEnded
}) {
    return (
        <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
            <button className={`burger ${isMenuOpen ? "active" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <i></i>
            </button>
            <div className="menu-content">
                <MenuList
                    title={settings.titleList}
                    points={points}
                    activeIndexes={activeIndexes} 
                    toggleActive={toggleActive}
                    haveSaved={haveSaved}
                />
                <MenuFilter 
                    openModal={openModal}
                    onInputDate={onInputDate}
                    fetchData={fetchData}
                    savePoint={savePoint}
                    deletePoints={deletePoints}
                    buildRoad={buildRoad}
                    isExperimentEnded={isExperimentEnded}
                />
            </div>
        </div>
    );
}

function Model({ points, activeIndexes, sensors }) {

    const [infoBox, setInfoBox] = useState(null);

    const sensorList = Object.values(sensors);

    const maxX = Math.max(...sensorList.map(s => s.x));
    const maxY = Math.max(...sensorList.map(s => s.y));

    const renderRoute = () => {
        if (activeIndexes.length < 2) return null;
    
        const sortedIndexes = [...activeIndexes].sort((a, b) => a - b);
    
        const routePoints = sortedIndexes.map(index => ({
            x: (points[index].x / maxX) * 100,
            y: (points[index].y / maxY) * 100
        }));
    
        const pathData = routePoints.map((point, i) =>
            i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
        ).join(' ');
    
        return (
            <svg className="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" >
                <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="-6" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,3 L6,6 L4,3 L6,0 Z" fill="black" />
                    </marker>
                </defs>
    
                <path d={pathData} stroke="black" strokeWidth="0.5" fill="none" markerStart="url(#arrow)" />
            </svg>
        );
    };

    const renderSensorLines = () => {
        if (!sensorList || sensorList.length < 2) return null;
    
        const scaledPoints = sensorList.map(sensor => ({
            x: (sensor.x / maxX) * 100,
            y: (sensor.y / maxY) * 100
        }));
    
        const pathData = scaledPoints.map((p, i) =>
            i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
        ).join(' ') + ' Z';
    
        return (
            <svg className="sensor-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d={pathData} stroke="red" strokeWidth="0.4" fill="none" />
            </svg>
        );
    };

    function getAverageSpeed(points, activeIndexes) {
        if (!activeIndexes || activeIndexes.length < 2) return [0,0];

        const sortedIndexes = [...activeIndexes].sort((a, b) => a - b);
    
        let totalDistance = 0;
        let totalTime = 0;
    
        for (let i = 1; i < sortedIndexes.length; i++) {
            const p1 = points[sortedIndexes[i - 1]];
            const p2 = points[sortedIndexes[i]];
            const distance = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
    
            const date1 = new Date(p1.timestamp * 1000);
            const date2 = new Date(p2.timestamp * 1000);
            const timeDiff = Math.abs(date2 - date1) / 1000;
    
            totalDistance += distance;
            totalTime += timeDiff;
        }
    
        if (totalTime === 0) return [totalDistance, 0];

        console.log(`${totalDistance} / ${totalTime}`);
    
        return [totalDistance, totalDistance / totalTime];
    }
    const [distance, speed] = getAverageSpeed(points, activeIndexes);

    return (
        <div className="main-content">
            <div className="model-block">
                <div className="model-img">
                    <div>
                        <p>Расстояние: {distance.toFixed(2)} {settings.units}</p>
                        <p>Средняя скорость: {speed.toFixed(2)} {settings.units}/с</p>
                    </div>
                    <div className="model-test">
                        <div className="model-test__block">
                            {sensorList.map((sensor, i) => {
                                const left = (sensor.x / maxX) * 100;
                                const top = (sensor.y / maxY) * 100;

                                return (
                                    <div
                                        key={`sensor-${i}`}
                                        className="sensor-dot"
                                        style={{
                                            top: `${top}%`,
                                            left: `${left}%`,
                                            position: 'absolute'
                                        }}
                                        title={`Датчик ${i + 1}`}
                                    >
                                        <span>{Math.round(sensor.x)}; {Math.round(sensor.y)}</span>
                                        <div>{`${i + 1}`}</div>
                                    </div>
                                );
                            })}
                            {activeIndexes?.map(index => {
                                const point = points[index];
                                const left = (point?.x / maxX) * 100;
                                const top = (point?.y / maxY) * 100;

                                const handleClick = () => {
                                    if (infoBox?.index === index) {
                                        setInfoBox(null); // Скрыть, если уже открыт
                                    } else {
                                        if (point?.timestamp != null) {
                                            const dateTime = new Date(point.timestamp * 1000);
                                            const [date, timeFull] = dateTime.toISOString().split("T");
                                            const time = timeFull.split(".")[0]; // убираем миллисекунды
                                            setInfoBox({
                                                index,
                                                date,
                                                time
                                            });
                                        }
                                    }
                                };

                                return (
                                    <div key={index}>
                                        <button
                                            onClick={handleClick}
                                            className={`object-button`}
                                            style={{ top: `${top}%`, left: `${left}%` }}
                                        >
                                            {index + 1}
                                        </button>
                                        {infoBox?.index === index && (
                                            <div
                                                className="info-box"
                                                style={{
                                                    top: `${top}%`,
                                                    left: `${left}%`,
                                                }}
                                            >
                                                <div>x: {point.x} {settings.units}; y: {point.y} {settings.units}</div>
                                                <div>Дата: {infoBox.date}</div>
                                                <div>Время: {infoBox.time.split(".")[0]}</div>
                                            </div>
                                        )}
                                    </div>
                                )
                                })
                            }
                            {renderRoute()}
                            {renderSensorLines()}
                            <div className="model-coordinate model-coordinate__x"></div>
                            <div className="model-coordinate model-coordinate__y"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Loading ({ isLoading }) {
    if (!isLoading) return null;

    return (
        <div className="overlay">
            <div className="spinner"></div>
        </div>
    );
}

const SensorInput = ({ number1, number2, value, onChange }) => {
  const inputId = `distance-${number1}${number2}`;

  const handleChange = (e) => {
    onChange(`distance_between_${number1}_and_${number2}`, e.target.value);
  };

  return (
    <div className="sensor-block">
      <div className="sensor-coords">
        <div className="coord-field">
          <label className="sensor-title" htmlFor={inputId}>
            Расстояние между {number1} и {number2} в см
          </label>
          <input type="number" step="1" min="0" id={inputId} value={value} onChange={handleChange}/>
        </div>
      </div>
    </div>
  );
};

function ModalTitle({ title, closeModal }) {
    return (
        <div className="modal-content__title">
            <span>{title}</span>
            <button onClick={closeModal}>
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
}

function DescModal({ closeModal, isModalOpen, modalType, setSensors, setIsLoading }) {
    const [activeTab, setActiveTab] = useState("sensor1");
    const [points, setPoints] = useState([]);
    const [distances, setDistances] = useState(() => {
        const distances = localStorage.getItem('distances');
        return distances
            ? JSON.parse(distances)
            : {
                distance_between_1_and_2: '170',
                distance_between_1_and_3: '170',
                distance_between_2_and_3: '170',
            };
    });
    const [error, setError] = useState(''); 

    const fetchDataPoints = () => {
        setIsLoading(true)
        const now = new Date();
        const from_time = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        let url = `${settings.api.url}?object_id=${settings.api.objectId}&from_time=${from_time.toISOString()}&to_time=${now.toISOString()}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => setPoints(data.locationPoints))
            .catch((err) => {
                alert("Ошибка загрузки: " + err.message);
                console.error("Ошибка загрузки:", err)
            })
            .finally(() => setIsLoading(false));
    };

    const tablePoints = () => {
        fetchDataPoints();
        handleTabClick("sensor2");
    }

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleSensorChange = (key, value) => {
        setDistances((prev) => ({
            ...prev,
            [key]: value,
        }));  
    };

    const handleSave = async () => {
        const hasEmpty = Object.values(distances).some((v) => v === '');
        if (hasEmpty) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }

        setError('');
        const url = `${settings.api.urlSensors}`;
        try {
            setIsLoading(true);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(distances),
            });

            if (!response.ok) {
                throw new Error('Ошибка при сохранении: ' + response.status);
            }

            const data = await response.json();

            if (typeof data === 'object' &&
                data !== null &&
                Object.keys(data).length === 3 &&
                Object.values(data).every(
                    (sensor) =>
                        typeof sensor === 'object' &&
                        sensor !== null &&
                        'x' in sensor &&
                        'y' in sensor
            )) {
                localStorage.setItem('distances', JSON.stringify(distances));
                localStorage.setItem('locationSensor', JSON.stringify(data));
                setSensors(data);
                alert('Датчики успешно обновлены!');
            } else {
                console.warn('Неверная структура sensors:', data);
                setError('Сервер вернул неожиданные данные');
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка: ' + err.message);
            setError('Ошибка при отправке данных на сервер');
        } finally {
            setIsLoading(false);
        }
    };

    const renderView = () => {
        switch (modalType) {
            case 'tables':
                return (
                    <>
                        <ModalTitle 
                            closeModal={closeModal} 
                            title={"Таблицы БД"}
                        />

                        <div className="modal-content__tabs">
                            <button
                                onClick={() => handleTabClick("sensor1")}
                                className={activeTab === "sensor1" ? "active" : ""}
                            >
                                Свойства датчиков
                            </button>
                            <button
                                onClick={() => tablePoints()}
                                className={activeTab === "sensor2" ? "active" : ""}
                            >
                                История местоположений
                            </button>
                        </div>

                        <div className="modal-content__table">
                            {activeTab === "sensor1" && (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>id</th>
                                            <th>Название</th>
                                            <th>Модель</th>
                                            <th>Комплектация</th>
                                            <th>Серийный номер</th>
                                            <th>Дата эксплуатации</th>
                                            <th>Списан</th>
                                            <th>Вывод из эксплуатации</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td>Ультразвуковой приемопередатчик</td>
                                            <td>HC-SR04</td>
                                            <td>Датчик</td>
                                            <td>SN427845</td>
                                            <td>20.05.2025</td>
                                            <td>Нет</td>
                                            <td>20.05.2027</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>Ультразвуковой приемопередатчик</td>
                                            <td>HC-SR04</td>
                                            <td>Датчик</td>
                                            <td>SN428954</td>
                                            <td>20.05.2025</td>
                                            <td>Нет</td>
                                            <td>20.05.2027</td>
                                        </tr>
                                        <tr>
                                            <td>3</td>
                                            <td>Ультразвуковой приемопередатчик</td>
                                            <td>HC-SR04</td>
                                            <td>Датчик</td>
                                            <td>SN150392</td>
                                            <td>20.05.2025</td>
                                            <td>Нет</td>
                                            <td>20.05.2027</td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}

                            {activeTab === "sensor2" && (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>№</th>
                                            <th>id</th>
                                            <th>x</th>
                                            <th>y</th>
                                            <th>Время</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {points?.map((point, index) => (
                                            <tr key={index}>
                                                <td>{index}</td>
                                                <td>{point.locationPointId}</td>
                                                <td>{point.x}</td>
                                                <td>{point.y}</td>
                                                <td>{point.timestamp}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                );
            case 'sensors':
                return (
                    <>
                        <ModalTitle 
                            closeModal={closeModal} 
                            title={"Введите датчики"}
                        /> 
                        <div className="sensors-container">
                            <SensorInput number1={1} number2={2} value={distances.distance_between_1_and_2} onChange={handleSensorChange} />
                            <SensorInput number1={2} number2={3} value={distances.distance_between_2_and_3} onChange={handleSensorChange} />
                            <SensorInput number1={1} number2={3} value={distances.distance_between_1_and_3} onChange={handleSensorChange} />
                        </div>
                        {error && <div style={{ color: 'red' }}>{error}</div>}
                        <button type="button" className="button-save" onClick={handleSave} >Сохранить</button>
                    </>
                );
            default:
                return <div>Не найдено</div>;
        }
    };

    return (
        <div className={`modal-overlay ${isModalOpen ? "open" : ""}`}>
            <div className="modal-background" onClick={closeModal}></div>
            <div className="modal-content">
                {renderView()}
            </div>
        </div>
    );
}

export function App() {
    const [points, setPoints] = useState([]);
    const [sensors, setSensors] = useState(() => {
        const locationSensor = localStorage.getItem('locationSensor');
        return locationSensor
            ? JSON.parse(locationSensor)
            : {"sensor1": {"x": 0, "y": 0}, "sensor2": {"x": 170, "y": 0}, "sensor3": {"x": 85, "y": 147}};
    });
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [modalType, setModalType] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeIndexes, setActiveIndexes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [haveSaved, setHaveSaved] = useState(false);
    const [isExperimentEnded, setIsExperimentEnded] = useState(false);

    const onInputDate = (type, value) => {
        const date = new Date(value);
        setActiveIndexes([]);
    
        if (isNaN(date.getTime())) {
            console.warn("Invalid date input");
            if (type === settings.inputDate[0].id) setDateFrom(null);
            if (type === settings.inputDate[1].id) setDateTo(null);
        } else {
            if (type === settings.inputDate[0].id) setDateFrom(date);
            if (type === settings.inputDate[1].id) setDateTo(date);
        }
    };

    /* Кнопка "Сохранить измерение" */
    const savePoint = async () => {
        const point = points[0];

        if (!point || !point.locationPointId) {
            console.error("ID не найден в points[0]");
            alert("ID не найден в points[0]");
            return;
        }
        setIsLoading(true);
        const url = `${settings.api.urlSave}/${point.locationPointId}/save`;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(point)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка запроса: ${response.status}`);
                }

                return;
            })
            .then(() => {
                console.log("Измерение сохранено");
                alert("Измерение сохранено");
            })
            .catch(error => {
                console.error("Ошибка при сохранении измерения:", error);
                alert("Ошибка при сохранении измерения: " + err.message);
            })
            .finally(() => setIsLoading(false));
    }

    /* Кнопка "Новый эксперимент" */
    const deletePoints = async () => {
        const url = `${settings.api.urlDelete}`;

        try {
            setIsLoading(true);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: "",
            });

            if (!response.ok) {
                throw new Error(`Ошибка запроса: ${response.status}`);
            }

            console.log("Измерения удалены");
            setActiveIndexes([]);
            setPoints([]);
            setIsExperimentEnded(false);
            alert("Измерения удалены");
        } catch (error) {
            console.error("Ошибка при удалении измерений:", error);
            alert("Ошибка при удалении измерений: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const buildRoad = () => {
        if (!window.confirm("Вы уверены?")) {
            return;
        }

        setActiveIndexes([]);
        setPoints([]);
        setIsLoading(true);

        const now = new Date();
        const from_time = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        const to_time = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        url = `${settings.api.url}?object_id=${settings.api.objectId}&from_time=${from_time.toISOString()}&to_time=${to_time.toISOString()}&limit=100`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                setPoints(data.locationPoints);
                setHaveSaved(false);
                setActiveIndexes(Array.from({ length: data.locationPoints.length }, (_, i) => i));
                setIsExperimentEnded(true);
            })
            .catch(err => {
                console.error("Ошибка загрузки:", err);
                alert("Ошибка загрузки: " + err.message);
            })
            .finally(() => setIsLoading(false));
    }
    
    /* Кнопка "Провести измерение" */
    const fetchData = async () => {
        setActiveIndexes([]);
        setPoints([]);
        setIsLoading(true);

        const now = new Date();
        let url = "";
        const from_time = dateFrom || new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        const to_time = dateTo || new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

        url = `${settings.api.url}?object_id=${settings.api.objectId}&from_time=${from_time.toISOString()}&to_time=${to_time.toISOString()}&limit=100`;

        // если обе даты null - два запроса
        if (dateFrom === null && dateTo === null) {
            const urlSaved = `${settings.api.url}?object_id=${settings.api.objectId}&from_time=${from_time.toISOString()}&to_time=${to_time.toISOString()}&limit=100`;

            Promise.all([
                fetch(urlSaved)
                    .then(res => res.ok ? res.json() : { locationPoints: [] })
                    .catch(() => ({ locationPoints: [] })),
                fetch(`${settings.api.url}?object_id=${settings.api.objectId}`)
                    .then(res => res.ok ? res.json() : { locationPoints: [] })
                    .catch(() => ({ locationPoints: [] })),
            ])
                .then(([savedData, rawData]) => {
                    const combined = [...rawData.locationPoints, ...savedData.locationPoints];
                    setPoints(combined);
                    setHaveSaved(savedData.locationPoints.length > 0);
                })
                .catch(err => {
                    console.error("Ошибка загрузки:", err);
                    alert("Ошибка загрузки: " + err.message);
                })
                .finally(() => setIsLoading(false));

        } else {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    setPoints(data.locationPoints);
                    setHaveSaved(false);
                })
                .catch(err => {
                    console.error("Ошибка загрузки:", err);
                    alert("Ошибка загрузки: " + err.message);
                })
                .finally(() => setIsLoading(false));
        }
    };
  
    const openModal = (modalType) => {
        setModalType(modalType);
        setIsModalOpen(true);
    };
  
    const toggleActive = (index) => {
        setActiveIndexes((prev) => {
            const updated = prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index];
            return updated;
        });
    };
  
    return (
        <div className="App">
            <Loading 
                isLoading={isLoading}
            />
            <DescModal 
                closeModal={() => setIsModalOpen(false)} 
                isModalOpen={isModalOpen}
                modalType={modalType}
                setSensors={setSensors}
                setIsLoading={setIsLoading}
            />
            <div className={`container ${isMenuOpen ? "menu-open" : ""}`}>
                <Model 
                    points={points} 
                    activeIndexes={activeIndexes} 
                    sensors={sensors}
                />
                <SidebarMenu
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    points={points}
                    activeIndexes={activeIndexes}
                    toggleActive={toggleActive}
                    openModal={openModal}
                    onInputDate={onInputDate}
                    fetchData={fetchData}
                    savePoint={savePoint}
                    deletePoints={deletePoints}
                    buildRoad={buildRoad}
                    haveSaved={haveSaved}
                    isExperimentEnded={isExperimentEnded}
                />
            </div>
        </div>
    );
  }