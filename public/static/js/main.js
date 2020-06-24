$(document.body).ready(() => {

    let socket = io();
    socket.on("connect", () => {
        console.log("connected");
    });

    let form = $("form");
    let temp = document.createElement("div");
    document.body.append(temp);
    temp.style.display = "inline-block";
    temp.style.fontSize = "18px";
    temp.style.display = "none";

    form.submit((e) => {
        e.preventDefault();
        const data = new FormData(form[0]);
        let cmd = data.get("cmd");
        let tc = data.get("textchannel");
        
        fetch(`/exec?cmd=${encodeURI(cmd)}&channel=${tc}`).then((res) => {
            console.log(res);
        }).catch((e) => {
            console.log(e);
        });
    });

    // $(".cmd").on('input', (e) => {
    //     const text = $(".cmd").val();
    //     temp.innerHTML = text;
    //     let hint = "join [user]".substring(text.length, 11);
    //     $(".hint").css("left", $(temp).width()+"px");
    //     $(".hint").text(hint);
    // });
});