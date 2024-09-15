(function (){
    const Answers = {
        quizRightAnswers: null,
        quiz: null,
        currentQuestionIndex: 0,
        contentElement: null,
        userAnswers: [],
        init() {
            const url = new URL(location.href);
            const testId = url.searchParams.get('id');
            const userAnswersString = url.searchParams.get('userAnswers');
            this.userAnswers = (userAnswersString.split(',')).map(str => +str);
            console.log(this.userAnswers);
            if(testId) {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://testologia.ru/get-quiz-right?id=' + testId, false);
                xhr.send();
                if(xhr.status === 200 && xhr.responseText) {
                    try {
                        this.quizRightAnswers = JSON.parse(xhr.responseText);
                    } catch (e) {
                        location.href = '#/';
                    }
                    console.log(this.quizRightAnswers)
                } else {
                    location.href = '#/';
                }

            } else {
                location.href = '#/'
            }
            if(testId) {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'http://testologia.ru/get-quiz?id=' + testId, false);
                xhr.send();
                if(xhr.status === 200 && xhr.responseText) {
                    try {
                        this.quiz = JSON.parse(xhr.responseText);
                    } catch (e) {
                        location.href = '#/';
                    }
                    this.handlerUserAnswers();
                    console.log(this.quiz)
                } else {
                    location.href = '#/';
                }

            } else {
                location.href = '#/'
            }
        },
        handlerUserAnswers() {

            const testTitle = document.getElementById('result-test-title-value');
            testTitle.innerText = this.quiz.name;
            this.contentElement = document.getElementById('content');
            this.contentElement.innerHTML = '';

           this.quiz.questions.forEach( (question, index) => {
                const questionTitleElement = document.createElement('div');
                questionTitleElement.className = 'question-title';
                questionTitleElement.innerHTML = '<span>Вопрос ' + (index + 1) + ':</span> '
                    + question.question;
               const optionsElement = document.createElement('div');
               optionsElement.className = 'question-options';
               //console.log("Вопрос № " + index);
               //console.log("Правильный ответ = " + this.quizRightAnswers[index])
               question.answers.forEach(answer => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'question-option';
                    const inputElement = document.createElement('input');
                    const inputId = 'answer-' + answer.id;
                    inputElement.className = 'option-answer';
                    inputElement.setAttribute('id', inputId);
                    inputElement.setAttribute('type', 'radio');
                    inputElement.setAttribute('name', 'answer');
                    inputElement.setAttribute('value', answer.id);
                    if (answer.id === this.userAnswers[index] && this.userAnswers[index] !== this.quizRightAnswers[index])  {
                        inputElement.classList.add('red-radio-button');
                    }
                   if (answer.id === this.userAnswers[index] && this.userAnswers[index] === this.quizRightAnswers[index])  {
                       inputElement.classList.add('green-radio-button');
                   }
                    const labelElement = document.createElement('label');
                    labelElement.setAttribute('for', inputId);
                    labelElement.innerText = answer.answer;

                    optionElement.appendChild(inputElement);
                    optionElement.appendChild(labelElement);

                    optionsElement.appendChild(optionElement);

                })
                this.contentElement.appendChild(questionTitleElement)
                this.contentElement.appendChild(optionsElement)
            })

        }
    }
    Answers.init()
})()