(function () {

    console.log("Injected script loaded");

    window.addEventListener("message", async (event) => {

        if (event.source !== window) return;
        if (event.data.type !== "DRAW_LINE") return;

        const chart = window.tvWidget._innerAPI().activeChart();

        const id = await chart.createShape(
            {
                time: Math.floor(Date.now()/1000),
                price: event.data.price
            },
            {
                shape: "horizontal_line",
                text: event.data.label
            }
        );

        window.postMessage({
            type: "DRAW_SUCCESS",
            id
        });

    });

})();
