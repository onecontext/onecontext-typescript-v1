
export const runMany = ({n, callable, callableArgs}:{n: number, callable: (args: any) => any, callableArgs: any}) => {

    // create one task
    let task = callable(callableArgs)

    // make n copies of the above task
    const tasks = Array.from({length:n}).map(x => task)

    return Promise.all(tasks).then((res) => {return res})
}

// const runit = async () => {
//     const r = await OneContext.parseYaml({yaml: file, verboseErrorHandling: false})
//     return r
// }
// ( async () => await runit() )()

// runMany({n: 1}).then((res) => {console.log(res)})

