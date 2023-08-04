// This is an interactive component, so it's a client component.
'use client'

import React, { useState, useEffect } from "react";

import styles from './Timeclock.module.css'
import moment, { duration } from "moment";

let countdown = -1;

/**
 * The default export for the view page.
 * 
 * @returns JSX representation of the edit page.
 */
export default function App() {

    let [employeeData, setEmployeeData] = useState("");
    let [timeclockData, setTimeclockData] = useState("");

    let [employees, setEmployees] = useState([]);

    let [start, setStart] = useState((moment().startOf('week').add(-2, 'week')).format('YYYY-MM-DD'));
    let [end, setEnd] = useState((moment().startOf('week').add(-1, 'day')).format('YYYY-MM-DD'));

    let [selected, setSelected] = useState(0);

    let [clock, setClock] = useState([]);
    let [changes, setChanges] = useState([]);
    let [changedClock, setChangedClock] = useState([]);

    useEffect(() => {
        
        let newClock = getClock(timeclockData, start, end, employees);

        setClock(newClock);

    }, [start, end, timeclockData, employees])

    useEffect(() => {

        setChangedClock(applyChanges(clock, changes));

    }, [clock, changes])

    useEffect(() => {
        
        if (employeeData != "") {

            let lines = employeeData.split('\n');

            let newEmployees = [];

            for (var i = 0; i < lines.length; i++){
                
                if (lines[i][0] != '#' && lines[i].length > 1) {
                    
                    try {

                        let values = lines[i].split(', ');

                        let ID = values[0].trim();
                        let shift = values[1].trim();
                        let name = values[2].trim();

                        let employee = {id: ID, shift: shift, name: name};

                        newEmployees.push(employee);

                    } catch (e) {}

                }

            }
            
            setEmployees(newEmployees);

            localStorage.setItem('employees', JSON.stringify(newEmployees));

        } else {
            
            setEmployees(localStorage.getItem('employees') ? JSON.parse(localStorage.getItem('employees')) : []);

        }

    }, [employeeData]);

    async function getEmployeeData(e) {

        e.preventDefault()
        const reader = new FileReader()
        reader.onload = async (e) => { 
            const text = (e.target.result)
            setEmployeeData(text);
        };
        if (Array.from(e.target.files).length > 0) reader.readAsText(e.target.files[0])

    }

    async function getTimeclockData(e) {

        e.preventDefault();

        setChanges([]);

        // Convert the FileList into an array and iterate
        let files = Array.from(e.target.files).map(file => {

            // Define a new file reader
            let reader = new FileReader();

            // Create a new promise
            return new Promise(resolve => {

                // Resolve the promise after reading file
                reader.onload = () => resolve(reader.result);

                // Read the file as a text
                reader.readAsText(file);

            });

        });

        // At this point you'll have an array of results
        let res = await Promise.all(files);

        setTimeclockData(res.join());

    }

    function deleteTime(id, unique) {

        console.log(unique);

        let newChanges = [...changes];

        let entry = clock.find((entry) => (entry.unique == unique));
        let change = newChanges.find((change) => (change.unique == unique));

        if (change != undefined) {

            change.deleted = !change.deleted;

        } else {

            if (entry != undefined) newChanges.push({ unique: unique, type: "update", deleted: !entry.deleted });
            else newChanges.push({ unique: unique, type: "update", deleted: true });

        }

        setChanges(newChanges);

    }

    function setBreak(unique, hasBreak) {

        let newChanges = [...changes];

        let change = newChanges.find((change) => (change.unique == unique));

        if (change != undefined) {

            change.hasBreak = hasBreak;

        } else {

            newChanges.push({ unique: unique, type: "update", hasBreak: hasBreak });

        }

        setChanges(newChanges);

    }

    function addTime(id, datetime) {

        if (datetime.length > 1) {

            let newChanges = [...changes];

            let date = datetime.substring(0, 10);
            let time = datetime.substring(11,16) + ":00";

            newChanges.push({unique: countdown, type: "create", id: id, date: date, time: time, deleted: false, created: true, hasBreak: false});

            setChanges(newChanges);

            countdown--;

        }

    }

        // JSX (RETURN VALUE)

    return (
        <div className={styles.container}>

            {/* DATA INPUT */}
            <div className={styles.input_data}>
                <h2>Input Data</h2>
                <h3>Employee Data: </h3><input type="file" accept=".dat, .txt" onInput={e => { getEmployeeData(e) }} onClick={ (e) => e.target.value = null } />
                <h3>Timeclock Data: </h3><input type="file" multiple={true} accept=".dat, .txt" onInput={e => { getTimeclockData(e) }} onClick={ (e) => e.target.value = null } />
                <h3>Starting Date: </h3><input type="date" defaultValue={(moment().startOf('week').add(-2, 'week')).format('YYYY-MM-DD')} onChange={e => { setStart(e.target.value) }} />
                <h3>Ending Date: </h3><input type="date" defaultValue={(moment().startOf('week').add(-1, 'day')).format('YYYY-MM-DD')} onChange={e => { setEnd(e.target.value) }} />
                <h3>Employees: </h3>
                <select name="employee" id="employee" value={selected} onChange={e => { setSelected(e.target.value) }}>
                    <option value={0} key={0}>Overview</option>
                    {employees.map((employee) => {
                        return <option value={employee.id} key={employee.id}>{employee.name}</option>
                    })}
                </select>
                <button onClick={ () => {
                    let next_employee = employees.find((e) => e.id > selected );
                    if (next_employee == undefined) setSelected(0);
                    else setSelected(next_employee.id);
                 } }> Next </button>
            </div>

            {/* EMPLOYEE DATA */}
            <div className={styles.employee_data}>
                {employees.find((employee) => employee.id == selected ) != undefined && 
                <EmployeeData   employee={employees.find((employee) => employee.id == selected )} 
                                data={changedClock.filter((entry) => selected == entry.id )} 
                                deleteTime={deleteTime} 
                                addTime={addTime} 
                                setBreak={setBreak}
                                start={start}
                                end={end} />}
                {selected == 0 && <Overview employees={employees} data={changedClock} start={start} end={end} />}
            </div>

        </div>
    );
}

function Overview ( { employees, data, start, end } ) {

    return <>
        <h2>Employees</h2>
        {
            employees.map((employee) => {
                return <li className={styles.employee_overview} key={employee.id}>
                    <b>{employee.name}</b>: {findHours( { data: data.filter((entry) => { return entry.id == employee.id && !entry.deleted }) } )}
                </li>;
            })
        }
    </>

}

function EmployeeData ( {employee, data, deleteTime, addTime, setBreak, start, end} ) {

    useEffect(() => {

    }, [employee, data])

    const [ datetime, setDatetime ] = useState("");

    const timeclockRows = []

    let gap = 0;

    let first, second;

    for (let i = 0; i < data.length; i++) {

        let clockin = data[i];

        timeclockRows.push(<li className={`${styles.clockin} 
                                ${(clockin.deleted && styles.deleted)} 
                                ${(clockin.created && styles.created)}`} 
                    key={clockin.unique}
                    onClick={() => deleteTime(clockin.id, clockin.unique)}>
                        {moment(clockin.date + ' ' + clockin.time).format('M/DD/YY - h:mm A')}
                </li>)

        if (!clockin.deleted) {
            gap++;
            if (gap % 2 == 1) first = new Date(clockin.date + ' ' + clockin.time);
            else {
                second = new Date(clockin.date + ' ' + clockin.time);

                let length = (second - first) / (1000 * 60 * 60);

                if (clockin.hasBreak) length -= 0.5;

                let hours = Math.floor(length);
                let minutes = Math.floor(60 * (length % 1));

                timeclockRows.push(<div className={styles.shift_time} key={clockin.unique + ' shift'}>
                    <p>
                        <b>Total: {`${hours} ${hours != 1 ? "hours" : "hour"}, ${minutes} ${minutes != 1 ? "minutes" : "minute"}`}</b>
                    </p>
                    <input type='checkbox' checked={clockin.hasBreak} onChange={(e) => setBreak(clockin.unique, e.target.checked)}/> Subtract Break
                </div>)
            }
        }

    }

    return <>
        <h2>{employee.name} (ID {employee.id}, Shift {employee.shift})</h2>
        
        <div className={styles.employee_flexbox}>
            <div className={styles.timeclock}>
                <h2>Timeclock</h2>
                <div>{timeclockRows}</div>
                <input type="datetime-local" onChange={(e) => setDatetime(e.target.value)} />
                <button onClick={(e) => addTime(employee.id, datetime)}>Add</button>
            </div>
            <div className={styles.results}>
                <h2>Hours</h2>
                <b>Total:</b> {findHours({data: data.filter((entry) => !entry.deleted)})}
                <h2>Display:</h2>
                <p className={styles.graphic}>{generateGraphic({data: data.filter((entry) => !entry.deleted), start, end})}</p>
            </div>
        </div>
    </>

}

function getClock (data, start, end, employees) {

    let newClock = [];

    let unique = 0;

    let lines = data.split('\n');

    let last = {};

    for (var i = 0; i < lines.length; i++){
            
        if (lines[i][0] != '#' && lines[i].length > 1) {
            
            try {

                let values = lines[i].split(/(\s)/).filter((x) => x.trim().length>0);

                let ID = values[0];
                let date = values[1];
                let time = values[2];

                let employee = employees.find((e) => e.id == ID);

                let double = false;
                let hasBreak = false;

                if (last[ID] != undefined) {
                    double = ((new Date(date + ' ' + time) - last[ID]) / 1000) < 60;
                    if (employee != undefined && employee.shift == 1) hasBreak = ((new Date(date + ' ' + time) - last[ID]) / (1000 * 60)) > 360;
                }
                
                
                last[ID] = new Date(date + ' ' + time);

                let clockin = {unique: unique, id: ID, date: date, time: time, deleted: double, created: false, hasBreak: hasBreak};

                if (start <= date && date <= end) {
                    newClock.push(clockin);
                    unique++;
                }

            } catch (e) { }

        }

    }

    return newClock;

}

function applyChanges ( clock, changes ) {

    let changedClock = [...clock];

    for (let i = 0; i < changes.length; i++) {

        let change = changes[i];

        if (change.type == "create") {

            if (!change.deleted) changedClock.push({unique: change.unique, id: change.id, date: change.date, time: change.time, deleted: change.deleted, created: change.created, hasBreak: change.hasBreak});

        } else if (change.type == "update") {

            let match = changedClock.find((clockin) => change.unique == clockin.unique);

            if (change.deleted != undefined) match.deleted = change.deleted;
            if (change.hasBreak != undefined) match.hasBreak = change.hasBreak;

        }

    }

    changedClock.sort((a, b) => {

        return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);

    })

    return changedClock;

}

function findHours( { data } ) {

    let total_hours = 0;

    for (let i = 0; i < data.length - 1; i += 2) {

        let first = data[i];
        let second = data[i + 1];

        let start_time = new Date(first.date + ' ' + first.time);
        let end_time = new Date(second.date + ' ' + second.time);

        let length = (end_time - start_time) / (1000 * 60 * 60);

        if (second.hasBreak) length -= 0.5;

        total_hours += length;

    }

    let hours = Math.floor(total_hours);
    let minutes = Math.floor(60 * (total_hours % 1));

    let output = `${hours} ${hours != 1 ? "hours" : "hour"}, ${minutes} ${minutes != 1 ? "minutes" : "minute"}`

    return output;

}

function generateGraphic( { data, start, end } ) {

    let graphic = [];

    let size = moment.duration(moment(end).diff(moment(start))).as('days') + 1;

    for (let i = 0; i < size; i++) {
        for (let z = 0; z < 24; z++) graphic.push('·');
    }

    for (let i = 0; i < data.length - 1; i += 2) {

        let first = data[i];
        let second = data[i + 1];

        let start_time = new Date(first.date + ' ' + first.time);
        let end_time = new Date(second.date + ' ' + second.time);

        let first_duration = Math.floor(moment.duration(moment(start_time).diff(moment(start))).as('hours'));
        let second_duration = Math.floor(moment.duration(moment(end_time).diff(moment(start))).as('hours'));

        if (first_duration < 0) first_duration = -1;
        if (second_duration >= size * 24) second_duration = size * 24;

        if (graphic[first_duration] == '·') graphic[first_duration] = '[';
        else graphic[first_duration] = '|';

        if (graphic[second_duration] == '·') graphic[second_duration] = ']';
        else graphic[second_duration] = '|';

        for (let i = first_duration + 1; i < second_duration; i++) {
            graphic[i] = '$';
        }

    }

    if (data.length % 2 == 1) {
        let first = data[data.length - 1];

        let start_time = new Date(first.date + ' ' + first.time);

        let first_duration = Math.floor(moment.duration(moment(start_time).diff(moment(start))).as('hours'));

        if (first_duration < 0) first_duration = -1;

        graphic[first_duration] = '?';

        for (let i = first_duration + 1; i < size * 24; i++) {
            graphic[i] = '?';
        }
    }

    let output = "";

    for (let i = 0; i < size; i++) {
        output += moment(start).add(i, 'day').format('MM/DD dd:');
        output += '|';
        for (let z = 0; z < 24; z++) output += graphic[(i * 24) + z];
        output += '|\n';
        if (i % 7 == 6) output += '\n';
    }

    return output;

}