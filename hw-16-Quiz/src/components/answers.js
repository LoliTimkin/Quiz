import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Answer {
    constructor() {
        this.routeParams = UrlManager.getQueryParams();
        this.quizAnswers = null;
        this.quiz = null;
        this.contentElement = null;
        this.init()
    }

    async init() {

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
                    this.quizAnswers = result;
                    this.handlerUserAnswers();
                }
            } catch (error) {
                console.log(error)
            }
        }

    }

    handlerUserAnswers() {

        const testTitle = document.getElementById('result-test-title-value');
        testTitle.innerText = this.quizAnswers.test.name;
        this.contentElement = document.getElementById('container-content');
        //this.contentElement.innerHTML = '';

        this.quizAnswers.test.questions.forEach((question, index) => {
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
                if (answer.correct === false) {
                    inputElement.classList.add('red-radio-button');
                }
                if (answer.correct === true) {
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
