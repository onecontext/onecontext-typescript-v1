
const run = async function (times, callable, args) {
    let start = Date.now();
    const promises = [];

    for (let i = 0; i < times; i++) {
        promises.push(callable(args));
    }

    await Promise.all(promises);

    let timeTaken = Date.now() - start;
    console.log("Total time taken : " + timeTaken/1000 + " seconds");
    console.log(`Ran test ${times} times: at a rate of ${Number(times/(timeTaken/1000)).toFixed(2)} times per second`);
    // string format to 2 decimal places
    console.log("Done");
};

export default run;
