import React, { useState, useEffect } from "react";

const settings = {
    api: {
        url: "http://localhost:9000/api/location",
        urlSensors: "http://localhost:9000/api/sensors",
        urlSave: "http://localhost:9000/api/location/save-point",
        objectId: "5f0f2e36-d1a6-4f1e-95a4-167f0e14e07c",
    },
    titleRadio: "Таблицы",
    titleInput: "Фильтр даты",
    titleList: "Точки",
    titlButtons: "Обновление данных",
    inputDate: [
        { id: "date_from", desc: "Дата от" },
        { id: "date_to", desc: "Дата до" }
    ],
    tablesDB: [
        { id: "sensors", desc: "Таблицы БД" },
    ],
}

function MenuDateInput({ title, inputDate, onChange }) {

    return(
        <fieldset className="menu-fieldset">
            <legend>{title}</legend>

            {inputDate.map((date) => (
                <div key={date.id} className="menu-input">
                    <label htmlFor={date.id}>{date.desc}</label>
                    <input type="datetime-local" step="1" id={date.id} onChange={(e) => onChange(date.id, e.target.value)}/>
                </div>
            ))}

        </fieldset>
    );    
}

function MenuButtons({ title, onClick1, onClick2, onClick3 }) {

    return(
        <fieldset className="menu-fieldset">
            <legend>{title}</legend>

            <div className="menu-db">
                <button type="button" onClick={() => onClick1()}>Обновить точки</button>
            </div>
            <div className="menu-db">
                <button type="button" onClick={() => onClick2()}>Обновить датчики</button>
            </div>
            <div className="menu-db">
                <button type="button" onClick={() => onClick3()}>Сохранить точку</button>
            </div>

        </fieldset>
    );
}

function MenuDB({ title, buttons, onClick }) {

    return(
        <fieldset className="menu-fieldset">
            <legend>{title}</legend>

            {buttons.map((mode) => (
                <div key={mode.id} className="menu-db">
                    <button type="button" onClick={() => onClick()}>{mode.desc}</button>
                </div>
            ))}

        </fieldset>
    );
}

function MenuFilter({ openModal, onInputDate, fetchData, fetchSensor, savePoint }) {

    return(
        <>
            <MenuDB
                title={settings.titleRadio}
                buttons={settings.tablesDB}
                onClick={openModal}
            />
            <MenuDateInput
                title={settings.titleInput}
                inputDate={settings.inputDate}
                onChange={onInputDate}
            />
            <MenuButtons
                title={settings.titlButtons}
                onClick1={fetchData}
                onClick2={fetchSensor}
                onClick3={savePoint}
            />
        </>
    );    
}

function MenuElement({ index, point, active, onClick }) {
    const dateTime = new Date(point?.timestamp * 1000).toISOString();
    const [date, time] = dateTime.split("T");

    return(
        <div 
            className={`menu-list__element ${active ? "active" : ""}`} 
            onClick={onClick}
        >
            <div>{index + 1}. {point.x} см, {point.y} см</div>
            <div>Дата: {date}</div>
            <div>Время: {time.split(".")[0]}</div>
        </div>
    ); 
}

function MenuList({ title, points, activeIndexes, toggleActive }) {

    return(
        <fieldset className="menu-fieldset menu-fieldset__points">
            <legend>{title}</legend>
            <div className="menu-list">
                {(points?.length === 0) ? 
                    <div>Точки отсутствуют</div> :
                    points?.map((point, index) => (
                        <MenuElement 
                            key={index}
                            index={index}
                            point={point} 
                            active={activeIndexes.includes(index)} 
                            onClick={() => toggleActive(index)}
                        />
                    ))}
            </div>
        </fieldset>
    ); 
}

function SidebarMenu({ isMenuOpen, setIsMenuOpen, points, activeIndexes, toggleActive, openModal, onInputDate, fetchData, fetchSensor, savePoint }) {
    return (
        <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
            <button className={`burger ${isMenuOpen ? "active" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <i></i>
            </button>
            <div className="menu-content">
                <MenuFilter 
                    openModal={openModal}
                    onInputDate={onInputDate}
                    fetchData={fetchData}
                    fetchSensor={fetchSensor}
                    savePoint={savePoint}
                />
                <MenuList
                    title={settings.titleList}
                    points={points} 
                    activeIndexes={activeIndexes} 
                    toggleActive={toggleActive}
                />
            </div>
        </div>
    );
}

function Model({ points, activeIndexes, sensors }) {

    const [infoBox, setInfoBox] = useState(null);

    const maxX = Math.max(...sensors.map(s => s.x));
    const maxY = Math.max(...sensors.map(s => s.y));

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
        if (!sensors || sensors.length < 2) return null;
    
        const scaledPoints = sensors.map(sensor => ({
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
        if (!activeIndexes || activeIndexes.length < 2) return 0;
    
        let totalDistance = 0;
        let totalTime = 0;
    
        for (let i = 1; i < activeIndexes.length; i++) {
            const p1 = points[activeIndexes[i - 1]];
            const p2 = points[activeIndexes[i]];
            const distance = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
    
            const t1 = new Date(p1.timestamp * 1000).toISOString();
            const t2 = new Date(p2.timestamp * 1000).toISOString();
            const timeDiff = Math.abs((t2 - t1) / 1000);
    
            totalDistance += distance;
            totalTime += timeDiff;
        }
    
        if (totalTime === 0) return 0;

        console.log(`${totalDistance} / ${totalTime}`);
    
        return totalDistance / totalTime;
    }

    return (
        <div className="main-content">
            <div className="model-block">
                <div className="model-img">
                    <p>Средняя скорость: {getAverageSpeed(points, activeIndexes).toFixed(2)} см/с</p>
                    <div className="model-test">
                        <div className="model-test__block">
                            {sensors.map((sensor, i) => {
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
                                        <span>{sensor.x}; {sensor.y}</span>
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
                                        [date, time] = point?.timestamp.split("T");
                                        setInfoBox({
                                            index,
                                            date,
                                            time
                                        });
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
                                                <div>x: {point.x} см; y: {point.y} см</div>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DescModal({ closeModal, isModalOpen }) {
    const [activeTab, setActiveTab] = useState("sensor1");
    const [points, setPoints] = useState([]);

    const fetchDataPoints = () => {
        const now = new Date();
        const from_time = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        let url = `${settings.api.url}?object_id=${settings.api.objectId}&from_time=${from_time.toISOString()}&to_time=${now.toISOString()}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => setPoints(data.locations))
            .catch((err) => console.error("Ошибка загрузки:", err));
    };

    const tablePoints = () => {
        fetchDataPoints();
        handleTabClick("sensor2");
    }

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className={`modal-overlay ${isModalOpen ? "open" : ""}`}>
            <div className="modal-background" onClick={closeModal}></div>
            <div className="modal-content">
                <div className="modal-content__title">
                    <span>Таблицы БД</span>
                    <button onClick={closeModal}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

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
                                    <th>Серийник</th>
                                    <th>Mac-адрес</th>
                                    <th>Дата эксплуатации</th>
                                    <th>Списан</th>
                                    <th>Гарантийная информация</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Датчик температуры</td>
                                    <td>DT-100</td>
                                    <td>Термодатчик + крепеж</td>
                                    <td>SN123456</td>
                                    <td>00:1A:2B:3C:4D:5E</td>
                                    <td>2023-05-10</td>
                                    <td>Нет</td>
                                    <td>Гарантия до 2026-05-10</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>Датчик влажности</td>
                                    <td>DH-200</td>
                                    <td>Датчик + модуль связи</td>
                                    <td>SN654321</td>
                                    <td>00:1B:3D:5F:7A:9C</td>
                                    <td>2022-11-23</td>
                                    <td>Нет</td>
                                    <td>Гарантия до 2025-11-23</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>Датчик давления</td>
                                    <td>DP-300</td>
                                    <td>Датчик + интерфейсный кабель</td>
                                    <td>SN789012</td>
                                    <td>00:2C:4E:6F:8B:AD</td>
                                    <td>2021-08-15</td>
                                    <td>Да</td>
                                    <td>Гарантия истекла</td>
                                </tr>
                            </tbody>
                        </table>
                    )}

                    {activeTab === "sensor2" && (
                        <table>
                            <thead>
                                <tr>
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
                                        <td>{point.x}</td>
                                        <td>{point.y}</td>
                                        <td>{point.timestamp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export function App() {
    const [points, setPoints] = useState([]);
    const [sensors, setSensors] = useState([{"x": 0, "y": 0}, {"x": 340, "y": 0}, {"x": 170, "y": 295}]);
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeIndexes, setActiveIndexes] = useState([]);

    const onInputDate = (type, value) => {
        const date = new Date(value);
        setActiveIndexes([]);
        // Корректировка временной зоны
        date.setHours(date.getHours() + 3);
    
        if (isNaN(date.getTime())) {
            console.warn("Invalid date input");
            if (type === settings.inputDate[0].id) setDateFrom(null);
            if (type === settings.inputDate[1].id) setDateTo(null);
        } else {
            if (type === settings.inputDate[0].id) setDateFrom(date);
            if (type === settings.inputDate[1].id) setDateTo(date);
        }
    };

    const savePoint = () => {
        const point = points[0];

        if (!point || !point.id) {
            console.error("ID не найден в points[0]");
            return;
        }

        const url = `${settings.api.urlSave}?object_id=${settings.api.objectId}&id=${point.id}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка запроса: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Точка сохранена:", data);
            })
            .catch(error => {
                console.error("Ошибка при сохранении точки:", error);
            });
    }
    
    const fetchData = () => {
        const now = new Date();
        let url = "";
        if (dateFrom === null && dateTo === null) {
            url = `${settings.api.url}?object_id=${settings.api.objectId}`;
        } else {
            const from_time = dateFrom || new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            const to_time = dateTo || new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            url = `${settings.api.url}?object_id=${settings.api.objectId}&from_time=${from_time.toISOString()}&to_time=${to_time.toISOString()}`;
        }
        
        fetch(url)
            .then((response) => response.json())
            .then((data) => setPoints(data.locationPoints))
            .catch((err) => console.error("Ошибка загрузки:", err));
    };

    const fetchSensor = () => {
        let url = settings.api.urlSensors;
        
        fetch(url)
            .then((response) => response.json())
            .then((data) => setSensors(data))
            .catch((err) => console.error("Ошибка загрузки:", err));

    };
  
    const openModal = () => {
        setIsModalOpen(true);
    };
  
    const toggleActive = (index) => {
        setActiveIndexes((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };
  
    return (
        <div className="App">
            <DescModal 
                closeModal={() => setIsModalOpen(false)} 
                isModalOpen={isModalOpen}
            />
            <div className={`container ${isMenuOpen ? "menu-open" : ""}`}>
                <Model points={points} activeIndexes={activeIndexes} sensors={sensors} />
                <SidebarMenu
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    points={points}
                    activeIndexes={activeIndexes}
                    toggleActive={toggleActive}
                    openModal={openModal}
                    onInputDate={onInputDate}
                    fetchData={fetchData}
                    fetchSensor={fetchSensor}
                    savePoint={savePoint}
                />
            </div>
        </div>
    );
  }