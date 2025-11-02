import { service } from "@/utils/http";
const isMock = true; 

export async function getAiExplanation(
  data: { question: string; answer: string }
): Promise<{ data: string }> {
  console.log(data); // 临时防止报错，我拿到后端后会删除
  if (isMock) {
    await new Promise((r) => setTimeout(r, 1000));

    const explanation = `题目讲解sample`;

    return { data: explanation };
  }
  // 后端上线后改
  return service.post("/ai/explanation", data);
}

export async function getSimilarQuestion(
  data: { question: string }
): Promise<{ data: string }> {
  console.log(data); // 临时防止报错，我拿到后端后会删除
  if (isMock) {
    await new Promise((r) => setTimeout(r, 1000));
    return { data: "回答sample" };
  }

  return service.post("/ai/similar", data);
}
