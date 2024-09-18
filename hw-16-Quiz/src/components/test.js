import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Test {
    constructor() {
        this.progressBarElement = null;
        this.questionTitleElement = null;
        this.optionsElement = null;
        this.nextButtonElement = null;
        this.passButtonElement = null;
        this.prevButtonElement = null;
        this.quiz = null;
        this.currentQuestionIndex = 1;
        this.userResult = [];
        this.routeParams = UrlManager.getQueryParams();
        this.init();
    }

        async init() {
            if (this.routeParams.id) {
                try {

                    const result = await CustomHttp.request('http://localhost:3000/api/tests/' + this.routeParams.id)

                    if (result) {
                        if (result.error) {
                            throw new Error(result.error);
                        }
                        this.quiz = result;
                        this.startQuiz();
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }

        startQuiz() {

            console.log(this.quiz);
            this.progressBarElement = document.getElementById('progress-bar');
            this.questionTitleElement = document.getElementById('title');
            this.optionsElement = document.getElementById('options');
            this.nextButtonElement = document.getElementById('next');
            this.nextButtonElement.onclick = this.move.bind(this,'next');
            this.passButtonElement = document.getElementById('pass');
            this.passButtonElement.onclick = this.move.bind(this,'pass');
            document.getElementById('pre-title').innerText = this.quiz.name;
            this.prevButtonElement = document.getElementById('prev');
            this.prevButtonElement.onclick = this.move.bind(this,'prev');
            this.prepareProgressBar();
            this.showQuestions();

            const timerElement = document.getElementById('timer');
            let seconds = 300;
                this.interval = setInterval(function () {
                seconds--;
                timerElement.innerText = seconds;
                if(seconds === 0) {
                    clearInterval(this.interval)
                    this.complete()
                }
            }.bind(this), 1000)

        }
        prepareProgressBar() {
            for (let i = 0; i < this.quiz.questions.length; i++) {
               const itemElement = document.createElement('div') ;
               itemElement.className = 'test-progress-bar-item ' + (i === 0? 'active' : '');

               const itemCircleElement = document.createElement('div');
               itemCircleElement.className = 'test-progress-bar-item-circle';

               const itemTextElement = document.createElement('div');
               itemTextElement.className = 'test-progress-bar-item-text';
               itemTextElement.innerText = 'Вопрос ' + (i + 1);

               itemElement.appendChild(itemCircleElement);
               itemElement.appendChild(itemTextElement);
               this.progressBarElement.appendChild(itemElement);

            }
        }
        showQuestions() {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            this.questionTitleElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex + ':</span> '
                + activeQuestion.question;
            this.optionsElement.innerHTML = '';
            const that = this;
            const chosenOption = this.userResult.find(item => {
                item.questionId === activeQuestion.id
            })
            activeQuestion.answers.forEach(answer => {
                const optionElement = document.createElement('div');
                optionElement.className = 'test-question-option';

                const inputElement = document.createElement('input');
                const inputId = 'answer-' + answer.id;
                inputElement.className = 'option-answer';
                inputElement.setAttribute('id', inputId);
                inputElement.setAttribute('type', 'radio');
                inputElement.setAttribute('name', 'answer');
                inputElement.setAttribute('value', answer.id);
                if(chosenOption && chosenOption.chosenAnswerId === answer.id) {
                    inputElement.setAttribute('checked', 'checked');
                }

                inputElement.onchange = function () {
                    that.chooseAnswer()
                }

                const labelElement = document.createElement('label');
                labelElement.setAttribute('for', inputId);
                labelElement.innerText = answer.answer;

                optionElement.appendChild(inputElement);
                optionElement.appendChild(labelElement);

                this.optionsElement.appendChild(optionElement);
            })

            if(chosenOption && chosenOption.chosenAnswerId === answer.id) {
                this.nextButtonElement.removeAttribute('disabled');
            } else {
                this.nextButtonElement.setAttribute('disabled', 'disabled');
            }
            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextButtonElement.innerText = 'Завершить'
            } else {
                this.nextButtonElement.innerText = 'Далее'
            }
            if (this.currentQuestionIndex > 1) {
                this.prevButtonElement.removeAttribute('disabled');
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled');
            }
        }
        chooseAnswer() {
            this.nextButtonElement.removeAttribute('disabled');
        }
        move(action) {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find(element => {
            return element.checked
            });

            let chosenAnswerId = null;
            if (chosenAnswer && chosenAnswer.value) {
                chosenAnswerId = Number(chosenAnswer.value);
            }

            const existingResult = this.userResult.find(item => {
                return item.questionId === activeQuestion.id;
            })

            if(existingResult) {
                existingResult.chosenAnswerId =  chosenAnswerId
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId
                })
            }

            console.log(this.userResult);

            if(action === "next" || action === "pass") {
                this.currentQuestionIndex++;
            } else {
                this.currentQuestionIndex--;
            }

            if(this.currentQuestionIndex > this.quiz.questions.length) {
                clearInterval(this.interval);
                this.complete();
                return;
            }

            Array.from(this.progressBarElement.children).forEach((item, index) => {

                const itemCurrentIndex = index +1;
                item.classList.remove('complete');
                item.classList.remove('active');
                if(itemCurrentIndex === this.currentQuestionIndex) {
                    item.classList.add('active')
                } else if(itemCurrentIndex < this.currentQuestionIndex) {
                    item.classList.add('complete')
                }
            })

            this.showQuestions()
        }
       async complete() {
            const userResultArray = this.userResult.map(obj => obj.chosenAnswerId);
            console.log(userResultArray);
            const userResultSting = userResultArray.join(",");
            console.log(userResultSting);

            const userInfo = Auth.getUserInfo();
            if (!userInfo) {
                location.href = '#/';
            }

           try {
               const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id
                   + '/pass', 'POST',
                   {
                       userId: userInfo.userId,
                       results: this.userResult
                   })

               if (result) {
                   if (result.error) {
                       throw new Error(result.error);
                   }
                   location.href = '#/result?id=' + this.routeParams.id;
               }
           } catch (error) {
               console.log(error)
           }

            /*const xhr = new XMLHttpRequest();
            xhr.open("POST", 'http://testologia.ru/pass-quiz?id=' + this.routeParams.id, false);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify({
                name: this.routeParams.name,
                lastName: this.routeParams.lastName,
                email: this.routeParams.email,
                results: this.userResult
                    })
            )*/

            /*if(xhr.status === 200 && xhr.responseText) {
                let result = null;
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = '#/';
                }
                if(result) {
                    console.log(result);
                    location.href = '#/result?score=' + result.score + '&total=' + result.total + '&userAnswers='
                    + userResultSting + '&id=' + this.routeParams.id;
                }
            } else {
                location.href = '#/';
            }*/

        }

    }
