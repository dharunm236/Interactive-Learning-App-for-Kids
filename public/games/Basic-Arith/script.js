const operators = ["+", "-", "*"];
let correctAnswer, correctOperator;

function generateProblem() {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let randomOp = operators[Math.floor(Math.random() * operators.length)];
    
    correctAnswer = eval(`${num1} ${randomOp} ${num2}`);
    correctOperator = randomOp;

    document.getElementById("num1").textContent = num1;
    document.getElementById("num2").textContent = num2;
    
    document.getElementById("operatorZone").textContent = " ";
    document.getElementById("answerZone").textContent = " ";
    document.getElementById("operatorZone").classList.remove("dropped");
    document.getElementById("answerZone").classList.remove("dropped");
    
    generateOptions(correctAnswer, correctOperator);
    document.getElementById("message").textContent = "";
}

function generateOptions(answer, operator) {
    let optionsContainer = document.getElementById("optionsContainer");
    optionsContainer.innerHTML = "";

    let options = [answer, operator];

    // Add some wrong options for more challenge
    while (options.length < 6) {
        let randNum = Math.floor(Math.random() * 20) - 5;
        let randOp = operators[Math.floor(Math.random() * operators.length)];
        
        if (!options.includes(randNum) && typeof randNum === "number") {
            options.push(randNum);
        }
        if (!options.includes(randOp)) {
            options.push(randOp);
        }
    }

    options = options.sort(() => Math.random() - 0.5);

    options.forEach(option => {
        let div = document.createElement("div");
        div.className = "option";
        div.textContent = option;
        div.draggable = true;
        div.addEventListener("dragstart", dragStart);
        optionsContainer.appendChild(div);
    });
}

function dragStart(event) {
    event.dataTransfer.setData("text", event.target.textContent);
    document.getElementById("dragSound").play();
}

document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', event => event.preventDefault());

    zone.addEventListener('drop', event => {
        event.preventDefault();
        const droppedValue = event.dataTransfer.getData('text');

        if ((zone.id === 'answerZone' && droppedValue == correctAnswer) || 
            (zone.id === 'operatorZone' && droppedValue === correctOperator)) {
            zone.textContent = droppedValue;
            zone.classList.add('dropped');
            document.getElementById("winSound").play();
            document.getElementById("message").textContent = "✅ Correct!";
        } else {
            document.getElementById("message").textContent = "❌ Try Again!";
        }
    });
});

generateProblem();
