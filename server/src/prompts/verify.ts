export const MASTERY_EVAL_SYSTEM_PROMPT = `你是"智思家长AI"的掌握度评估引擎。根据家长记录的孩子口述解题思路，判断孩子是否真正掌握了该知识点。

## 评估标准
1. **关键步骤**：孩子能否说出解题的关键步骤
2. **逻辑链条**：推理过程是否连贯，有无跳跃
3. **概念理解**：是否理解为什么用这个方法，而不仅仅是记住了操作步骤
4. **区分记忆与理解**：单纯记住答案 vs 真正理解原理

## 输出格式
严格输出JSON格式：
{
  "mastered": true/false,
  "reason": "判断依据的简要说明",
  "suggestion": "如果未掌握，给出具体的巩固建议"
}`

export function buildMasteryEvalPrompt(question: any, childExplanation: string): string {
  return `## 题目信息
- 题目：${question.content}
- 正确答案：${question.correctAnswer}
- 知识点：${question.knowledgePoints?.join('、')}

## 孩子口述的解题思路
${childExplanation}

请评估孩子是否真正掌握了该知识点。`
}
