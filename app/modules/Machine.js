import styles from './Machine.module.css';

export default function Machine({data}) {
    let width = (data.xdim * 120) - 5;
    let height = (data.ydim * 120) - 5;
    let top = 5 + (data.ypos - 1) * 120;
    let left = 5 + (data.xpos - 1) * 120;

    return (
        <>
            <button 
                className={styles.machine}
                style={ { width: `${width}px`,
                          height: `${height}px`,
                          top: `${top}px` ,
                          left: `${left}px` } }
                >
                    {data.name}
            </button><br />
        </>
    )
}
