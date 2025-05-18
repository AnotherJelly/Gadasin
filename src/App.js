import React, { useState, useEffect, Children } from "react";

const settings = {
    api: {
        url: "http://localhost:9000/api/location",
        urlSensors: "http://localhost:9000/api/sensors/set-coordinates",
        urlSave: "http://localhost:9000/api/location",
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
        { id: "sensors", desc: "Таблицы БД", modalType: "tables" },
        { id: "sensorsSave", desc: "Обновить датчики", modalType: "sensors" },
    ],
    units: "см"
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

function MenuButtons({ title, onClick1, onClick2 }) {

    return(
        <fieldset className="menu-fieldset">
            <legend>{title}</legend>

            <div className="menu-db">
                <button type="button" onClick={() => onClick1()}>Обновить точки</button>
            </div>
            <div className="menu-db">
                <button type="button" onClick={() => onClick2()}>Сохранить точку</button>
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
                    <button type="button" onClick={() => onClick(mode.modalType)}>{mode.desc}</button>
                </div>
            ))}

        </fieldset>
    );
}

function MenuFilter({ openModal, onInputDate, fetchData, savePoint }) {

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
                onClick2={savePoint}
            />
        </>
    );    
}

function MenuElement({ index, point, active, onClick }) {
    const dateTime = new Date(point?.timestamp * 1000);
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

function SidebarMenu({ isMenuOpen, setIsMenuOpen, points, activeIndexes, toggleActive, openModal, onInputDate, fetchData, savePoint }) {
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
        if (!activeIndexes || activeIndexes.length < 2) return 0;
    
        let totalDistance = 0;
        let totalTime = 0;
    
        for (let i = 1; i < activeIndexes.length; i++) {
            const p1 = points[activeIndexes[i - 1]];
            const p2 = points[activeIndexes[i]];
            const distance = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
    
            const date1 = new Date(p1.timestamp * 1000);
            const date2 = new Date(p2.timestamp * 1000);
            const timeDiff = Math.abs(date2 - date1) / 1000;
    
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
                    <p>Средняя скорость: {getAverageSpeed(points, activeIndexes).toFixed(2)} {settings.units}/с</p>
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
                                        const dateTime = new Date(point?.timestamp * 1000);
                                        [date, time] = dateTime.toISOString().split("T");
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
                        </div>
                    </div>
                </div>
            </div>
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
            Расстояние между {number1} и {number2}
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

function DescModal({ closeModal, isModalOpen, modalType, setSensors }) {
    const [activeTab, setActiveTab] = useState("sensor1");
    const [points, setPoints] = useState([]);
    const [distances, setDistances] = useState({
        distance_between_1_and_2: '',
        distance_between_1_and_3: '',
        distance_between_2_and_3: '',
    });
    const [error, setError] = useState(''); 

    const fetchDataPoints = () => {
        const now = new Date();
        const from_time = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        let url = `${settings.api.url}?object_id=${settings.api.objectId}&from_time=${from_time.toISOString()}&to_time=${now.toISOString()}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => setPoints(data.locationPoints))
            .catch((err) => console.error("Ошибка загрузки:", err));
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
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(distances),
            });

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
                setSensors(data);
                setDistances({
                    distance_between_1_and_2: '',
                    distance_between_1_and_3: '',
                    distance_between_2_and_3: '',
                });
            } else {
                console.warn('Неверная структура sensors:', data);
                setError('Сервер вернул неожиданные данные');
            }

            if (!response.ok) {
                throw new Error('Ошибка при сохранении');
            }

            alert('Датчики успешно обновлены!');
        } catch (err) {
            console.error(err);
            setError('Ошибка при отправке данных на сервер');
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
                            <SensorInput number1={1} number2={3} value={distances.distance_between_1_and_3} onChange={handleSensorChange} />
                            <SensorInput number1={2} number2={3} value={distances.distance_between_2_and_3} onChange={handleSensorChange} />
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
    const [sensors, setSensors] = useState({"sensor1": {"x": 0, "y": 0}, "sensor2": {"x": 340, "y": 0}, "sensor3": {"x": 170, "y": 295}});
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [modalType, setModalType] = useState();
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

        if (!point || !point.locationPointId) {
            console.error("ID не найден в points[0]");
            return;
        }

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
            url = `${settings.api.url}?object_id=${settings.api.objectId}&from_time=${from_time.toISOString()}&to_time=${to_time.toISOString()}&limit=100`;
        }
        
        fetch(url)
            .then((response) => response.json())
            .then((data) => setPoints(data.locationPoints))
            .catch((err) => console.error("Ошибка загрузки:", err));
    };
  
    const openModal = (modalType) => {
        setModalType(modalType);
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
                modalType={modalType}
                setSensors={setSensors}
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
                    savePoint={savePoint}
                />
            </div>
        </div>
    );
  }