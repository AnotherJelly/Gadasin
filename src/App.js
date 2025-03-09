import React, { StrictMode, useState, useEffect } from "react";

const settings = {
    api: {
        url: "http://localhost:5000/api/location",
        objectId: "123",
    },
    titleRadio: "Режим работы",
    titleInput: "Фильтр даты",
    titleList: "Точки",
    inputDate: [
        { id: "date_from", desc: "Дата от" },
        { id: "date_to", desc: "Дата до" }
    ],
    radioModes: [
        { id: "track", desc: "Отслеживать последнее" },
        { id: "history", desc: "История местоположений" },
    ],
    promts: {
        promtList: { title: "Точки", desc: "Описание точек" },
        promtRadio: { title: "Режим работы", desc: "Описание режимов работы" },
        promtInput: { title: "Фильтр даты", desc: "Описание фильтра даты" }
    },
    img: { width: 993, height: 656 }
}

function MenuDateInput({ title, inputDate, openModal, promt, onChange }) {

    return(
        <fieldset className="menu-fieldset">
            <legend>{title} <span onClick={() => openModal(promt)}>?</span></legend>

            {inputDate.map((date) => (
                <div key={date.id} className="menu-input">
                    <label htmlFor={date.id}>{date.desc}</label>
                    <input type="datetime-local" step="1" id={date.id} onChange={(e) => onChange(date.id, e.target.value)}/>
                </div>
            ))}

        </fieldset>
    );    
}

function MenuRadio({ title, radioModes, openModal, promt }) {

    return(
        <fieldset className="menu-fieldset">
            <legend>{title} <span onClick={() => openModal(promt)}>?</span></legend>

            {radioModes.map((mode) => (
                <div key={mode.id} className="menu-radio">
                    <input type="radio" id={mode.id} name="menu-radio" value={mode.id}  />
                    <label htmlFor={mode.id}>{mode.desc}</label>
                </div>
            ))}

        </fieldset>
    );
}

function MenuFilter({ openModal, onInputDate }) {

    return(
        <>
            <MenuRadio
                title={settings.titleRadio}
                radioModes={settings.radioModes}
                openModal={openModal}
                promt={settings.promts.promtRadio}
            />
            <MenuDateInput
                title={settings.titleInput}
                inputDate={settings.inputDate}
                openModal={openModal}
                promt={settings.promts.promtInput}
                onChange={onInputDate}
            />
        </>
    );    
}

function MenuElement({ index, point, active, onClick }) {
    const [date, time] = point.timestamp.split("T");

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

function MenuList({ title, points, activeIndexes, toggleActive, openModal, promt }) {

    return(
        <fieldset className="menu-fieldset menu-fieldset__points">
            <legend>{title} <span onClick={() => openModal(promt)}>?</span></legend>
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
                    openModal={openModal}
                    promt={settings.promts.promtList}
                />
            </div>
        </div>
    );
}

function Model({ points, activeIndexes }) {

    return (
        <div className="main-content">
            <div className="model-block">
                <div className="model-img">
                    <img src="test.png" alt="Чертёж" loading="lazy" draggable="false" />
                </div>

                {activeIndexes?.map(index => {

                    const left = points[index]?.x/settings.img.width * 100;
                    const bottom = points[index]?.y/settings.img.height * 100;

                    return (
                        <button 
                            key={index} 
                            className={`object-button`}
                            style={{ bottom: `${bottom}%`, left: `${left}%` }}
                        >
                            {index + 1}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}

function DescModal({ closeModal, isModalOpen, promt }) {
    return (
        <div className={`modal-overlay ${isModalOpen ? "open" : ""}`}>
            <div className="modal-background" onClick={closeModal}></div>
            <div className="modal-content">
                <div className="modal-content__title">
                    <span>{promt.title}</span>
                    <button onClick={closeModal}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-content__text">
                    {promt.desc}
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
    const [promt, setPromt] = useState({ title: "", desc: "" });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeIndexes, setActiveIndexes] = useState([]);

    const onInputDate = (type, value) => {
        const date = new Date(value);

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

    const fetchData = () => {
        let url = `${settings.api.url}?object_id=${settings.api.objectId}`;
        if (dateFrom) {
            url += `&from_time=${dateFrom.toISOString()}`;
        }
        if (dateTo) {
            url += `&to_time=${dateTo.toISOString()}`;
        }
        fetch(url)
            .then((response) => response.json())
            .then((data) => setPoints(data.locations))
            .catch((err) => console.error("Ошибка загрузки:", err));
    };

    // Обновление данных каждые 5 секунд
    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, [dateFrom, dateTo]);
  
    const openModalWithPromt = (promt) => {
        setPromt(promt);
        setIsModalOpen(true);
    };
  
    const toggleActive = (index) => {
        setActiveIndexes((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };
  
    return (
        <div className="App">
            <DescModal closeModal={() => setIsModalOpen(false)} isModalOpen={isModalOpen} promt={promt} />
            <div className={`container ${isMenuOpen ? "menu-open" : ""}`}>
            <Model points={points} activeIndexes={activeIndexes} />
            <SidebarMenu
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                points={points}
                activeIndexes={activeIndexes}
                toggleActive={toggleActive}
                openModal={openModalWithPromt}
                onInputDate={onInputDate}
            />
            </div>
        </div>
    );
  }