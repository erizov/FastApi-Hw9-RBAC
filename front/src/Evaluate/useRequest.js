import { requestEvaluate, requestResume, requestVacancy } from "../requests"
import { useRequestData } from "../useRequestData"

export const useRequest = (authRequest) => {
 const {loading:evaluateLoading, loadData: evaluateLoadData, 
    items: evaluateItems} = useRequestData(()=>requestEvaluate(authRequest))   
     const {loading:vacancyLoading, loadData: vacancyLoadData, 
    items: vacancyItems} = useRequestData(()=>requestVacancy(authRequest))   
     const {loading:resumeLoading, loadData: resumeLoadData, 
    items: resumeItems} = useRequestData(()=>requestResume(authRequest))   

    const loading = evaluateLoading|vacancyLoading|resumeLoading;
    const loadData = () => Promise.all([resumeLoadData(), vacancyLoadData(), evaluateLoadData()]);

    const items = evaluateItems.map(item=>{
        return {
            key: item.key,
            result: item.result,
            resumeName: resumeItems.find(e=>e.key===item.resume_id.toString())?.name ?? item.resume_id,
            resumeId: item.resume_id,
            vacancyName: vacancyItems.find(e=>e.key===item.vacancy_id.toString())?.name ?? item.vacancy_id,
            vacancyId: item.vacancy_id,
        }
    });

    return {loading, loadData, items}
}