let a = 'oshri';
const showalert = () => {
    alert(a);
}

export const Click = () => {
    return(
        <button onClick={() => {alert(a)}}>click me</button>
    )
}

