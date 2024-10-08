import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Result  {
        constructor() {
            this.routeParams = UrlManager.getQueryParams();
            /*document.getElementById('result-score').innerText = this.routeParams.score
                + '/' + this.routeParams.total;*/
            //const testId = url.searchParams.get('id')
            const testId = this.routeParams.id;
            let nextPage = document.getElementById('answers-link');
            nextPage.addEventListener('click', function(event) {
                //const userAnswersString = url.searchParams.get('userAnswers');
                //location.href = 'answers.html?userAnswers=' + userAnswersString + '&id=' + testId;
                event.preventDefault();
                location.href = '#/answers?id=' + testId;
            })

            this.init();
        }

        async init() {
            const userInfo = Auth.getUserInfo();
            if(!userInfo) {
                location.href = '#/'
            }

            if(this.routeParams.id) {
                try {
                    const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id +
                        '/result?userId=' + userInfo.userId
                    )

                    if (result) {
                        if (result.error) {
                            throw new Error(result.error);
                        }
                        document.getElementById('result-score').innerText = result.score + '/' + result.total;
                        return;
                    }
                } catch (error) {
                    console.log(error)
                }
            }

            location.href = '#/'
        }
    }