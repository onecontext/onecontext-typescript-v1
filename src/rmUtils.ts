import { performance } from 'perf_hooks';

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
};

function logWithColor(message: string, color: keyof typeof colors): void {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

export function textWithColor(message: string, color: keyof typeof colors): string {
    return`${colors[color]}${message}${colors.reset}`;
}
export function textWithIntSelectedColor(message: string, integerSelect: number, returnColor: boolean): any {
    // for cycling through updates and changing colors on the go
    const choices: (keyof typeof colors)[] = Object.keys(colors).filter((color) => color !== "reset") as (keyof typeof colors)[];
    const index = (integerSelect - 1) % choices.length; // Subtracting 1 because arrays are 0-indexed
    const colorChoice: keyof typeof colors = choices[index];
    if (!returnColor) {
        return `${colors[colorChoice]}${message}${colors.reset}`;
    } else {
        return {text: `${colors[colorChoice]}${message}${colors.reset}`, color: colorChoice};
    }
}

export const runMany = async ({n, callable, callableArgs}:{n: number, callable: (callableArgs: any) => any, callableArgs: any}) => {
    const t0 = performance.now();

    // Create an array of Promises by invoking the callable function `n` times
    const tasks = Array.from({length: n}, () => callable(callableArgs));

    const results = await Promise.all(tasks);

    const t1 = performance.now();
    console.log(`This call executed ${textWithColor(String(n), "yellow")} times.\nThe total time taken was ${textWithColor((t1 - t0).toFixed(3), "green")} milliseconds.\nThe average time per execution was ${textWithColor(((t1 - t0) / n).toFixed(3), "magenta")} milliseconds.`)
    return results;
}


// const runit = async () => {
//     const r = await OneContext.parseYaml({yaml: file, verboseErrorHandling: false})
//     return r
// }
// ( async () => await runit() )()

// runMany({n: 1}).then((res) => {console.log(res)})

