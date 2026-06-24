console.log("===== INJECTED SCRIPT =====");

let tries = 0;

const timer = setInterval(() => {

    tries++;

    console.log("Attempt", tries);

    console.log("typeof tvWidget =", typeof tvWidget);

    if (typeof tvWidget !== "undefined") {

        clearInterval(timer);

        console.log("FOUND tvWidget");

        console.log(tvWidget);

        (async () => {

            try {

                const id = await tvWidget.activeChart().createShape(
                    {
                        time: Math.floor(Date.now() / 1000),
                        price: 24200
                    },
                    {
                        shape: "horizontal_line",
                        text: "INJECT TEST"
                    }
                );

                console.log("SUCCESS", id);

            } catch (e) {

                console.error(e);

            }

        })();

    }

    if (tries > 30) {

        clearInterval(timer);

        console.log("FAILED");

    }

},1000);
