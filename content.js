console.clear();

console.log("Content script loaded");

const script = document.createElement("script");

script.textContent = `
    console.log("===== PAGE SCRIPT =====");

    console.log("window.tvWidget =", window.tvWidget);

    console.log("typeof tvWidget =", typeof tvWidget);

    if(window.tvWidget){

        console.log("SUCCESS PAGE");

    }else{

        console.log("FAILED PAGE");

    }
`;

(document.head || document.documentElement).appendChild(script);

script.remove();
