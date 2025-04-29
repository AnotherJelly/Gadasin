import React, { StrictMode, useState, useEffect } from "react";
import testImage from './test.png';

const settings = {
    api: {
        url: "http://localhost:5000/api/location",
        objectId: "1",
        time: 5000
    },
    titleRadio: "Таблицы",
    titleInput: "Фильтр даты",
    titleList: "Точки",
    inputDate: [
        { id: "date_from", desc: "Дата от" },
        { id: "date_to", desc: "Дата до" }
    ],
    tablesDB: [
        { id: "sensors", desc: "Таблицы БД" },
    ],
    img: { width: 340, height: 295 }
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

function MenuDB({ title, tablesDB, openModal }) {

    return(
        <fieldset className="menu-fieldset">
            <legend>{title}</legend>

            {tablesDB.map((mode) => (
                <div key={mode.id} className="menu-db">
                    <button type="button" onClick={() => openModal()}>{mode.desc}</button>
                </div>
            ))}

        </fieldset>
    );
}

function MenuFilter({ openModal, onInputDate }) {

    return(
        <>
            <MenuDB
                title={settings.titleRadio}
                tablesDB={settings.tablesDB}
                openModal={openModal}
            />
            <MenuDateInput
                title={settings.titleInput}
                inputDate={settings.inputDate}
                onChange={onInputDate}
            />
        </>
    );    
}

function MenuElement({ index, point, active, onClick }) {
    const [date, time] = point?.timestamp.split("T");

    return(
        <div 
            className={`menu-list__element ${active ? "active" : ""}`} 
            onClick={onClick}
        >
            <div>{index + 1}. {point.x} мм, {point.y} мм</div>
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

function SidebarMenu({ isMenuOpen, setIsMenuOpen, points, activeIndexes, toggleActive, openModal, onInputDate }) {
    return (
        <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
            <button className={`burger ${isMenuOpen ? "active" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <i></i>
            </button>
            <div className="menu-content">
                <MenuFilter 
                    openModal={openModal}
                    onInputDate={onInputDate}
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

function Model({ points, activeIndexes }) {

    const [infoBox, setInfoBox] = useState(null);

    const renderRoute = () => {
        if (activeIndexes.length < 2) return null;
    
        const sortedIndexes = [...activeIndexes].sort((a, b) => a - b);
    
        const routePoints = sortedIndexes.map(index => ({
            x: (points[index].x / settings.img.width) * 100,
            y: (points[index].y / settings.img.height) * 100
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

    return (
        <div className="main-content">
            <div className="model-block">
                <div className="model-img">
                    <div className="model-test">
                        <div className="model-test__block">
                            {activeIndexes?.map(index => {
                                const point = points[index];
                                const left = (point?.x / settings.img.width) * 100;
                                const top = (point?.y / settings.img.height) * 100;

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
                                                <div>x: {point.x} мм; y: {point.y} мм</div>
                                                <div>Дата: {infoBox.date}</div>
                                                <div>Время: {infoBox.time.split(".")[0]}</div>
                                            </div>
                                        )}
                                    </div>
                                )
                                })
                            }
                            {renderRoute()}
                        </div>
                    </div>
                    <img src={testImage} alt="Чертёж" loading="lazy" draggable="false" />
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

        console.log(date);
    
        if (isNaN(date.getTime())) {
            console.warn("Invalid date input");
            if (type === settings.inputDate[0].id) setDateFrom(null);
            if (type === settings.inputDate[1].id) setDateTo(null);
        } else {
            if (type === settings.inputDate[0].id) setDateFrom(date);
            if (type === settings.inputDate[1].id) setDateTo(date);
        }
    };
    
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
            .then((data) => setPoints(data.locations))
            .catch((err) => console.error("Ошибка загрузки:", err));
    };

    // Обновление данных каждые settings.api.time секунд
    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, settings.api.time);
        return () => clearInterval(intervalId);
    }, [dateFrom, dateTo]);
  
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
                <Model points={points} activeIndexes={activeIndexes} />
                <SidebarMenu
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    points={points}
                    activeIndexes={activeIndexes}
                    toggleActive={toggleActive}
                    openModal={openModal}
                    onInputDate={onInputDate}
                />
            </div>
        </div>
    );
  }