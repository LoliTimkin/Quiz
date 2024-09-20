import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Answer {
    constructor() {
        this.routeParams = UrlManager.getQueryParams();
        this.quizAnswers = null;
        this.quiz = null;
        this.currentQuestionIndex = 0;
        this.contentElement = null;
        this.userAnswers = [];
        this.init()
    }

    async init() {
        //const url = new URL(location.href);
        //const testId = url.searchParams.get('id');
        //const testId = this.routeParams.id;
        //const userAnswersString = url.searchParams.get('userAnswers');
        //this.userAnswers = (userAnswersString.split(',')).map(str => +str);
        //console.log(this.userAnswers);
        const userInfo = Auth.getUserInfo();

        if (!userInfo) {
            location.href = '#/'
        }

        if (this.routeParams.id) {
            try {

                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id)

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.quiz = result;
                }
            } catch (error) {
                console.log(error)
            }
        }

        if (this.routeParams.id) {
            try {

                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id +
                    '/result/details?userId=' + userInfo.userId)

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    //this.quizAnswers = result;
                    //console.log(result)
                }
            } catch (error) {
                console.log(error)
            }
        }

    }

    handlerUserAnswers() {

        const testTitle = document.getElementById('result-test-title-value');
        testTitle.innerText = this.quiz.name;
        this.contentElement = document.getElementById('content');
        this.contentElement.innerHTML = '';

        this.quiz.questions.forEach((question, index) => {
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
                if (answer.id === this.userAnswers[index] && this.userAnswers[index] !== this.quizRightAnswers[index]) {
                    inputElement.classList.add('red-radio-button');
                }
                if (answer.id === this.userAnswers[index] && this.userAnswers[index] === this.quizRightAnswers[index]) {
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
