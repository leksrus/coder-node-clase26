const random = require('random');


function randomCalc(cant) {
    let obj = Object.assign({});

    for (let i = 0; i < cant; i++) {
        const rnd = random.int(1, 1000);
        if(Object.keys(obj).length === 0) obj[rnd] = 1;
        else {
            for (const key of Object.keys(obj)) {

                if(rnd.toString() === key)
                    obj[key]++;
                else
                    obj[rnd] = 1;
            }
        }
    }

    return obj
}


process.on('message', cant => {
    console.log(`worker #${process.pid} started cant: ${cant}`);
    const obj = randomCalc(cant);
    process.send(obj);
    console.log(`worker #${process.pid} finalizó su trabajo`);
    process.exit();
});



