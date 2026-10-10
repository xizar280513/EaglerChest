(() => {
    function openGC(){
        var title = document.getElementsByTagName("title");
        title.innerText += "Classroom";
        var link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
        link.href = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Google_Classroom_Logo.svg/2372px-Google_Classroom_Logo.svg.png';

        var iframe = document.createElement("iframe");
        iframe.src = "https://classroom.google.com";
        iframe.style = "width: 100%; height: 100%; position: absolute; top: 0; left: 0;";

        ModAPI.addEventListener("key", (ev) => {
            //backslash
            if (ev.key == 43){
                iframe.remove();
            }
        })

        document.body.appendChild(iframe);
    }
    ModAPI.addEventListener("key", (ev) => {
        //l
        if (ev.key == 39){
            openGC();
        }
    })
})
