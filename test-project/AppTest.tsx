// @ts-expect-error THIS FILE DOESN'T WORK ITS JUST HERE TO TEST

import styles from "./AppTest.module.scss";

const AppTest = () => {
    return <div className={styles.AppTestBox}>
        <h1 className={styles.AppTestHeader}>
            Test - Find Dead Classes
        </h1>
        <p className={styles.AppTestP}>This is some test calling a dead class.</p>
    </div>
}
