
import { GoogleGenAI } from "@google/genai";

/**
 * 抗 AI 检测协议 (De-AI Protocol):
 * 1. 禁用逻辑连接词：屏蔽“总而言之、然而、这意味着、随着...”等 AI 习惯性转场。
 * 2. 引入叙事熵值：通过改变句子长度和结构，打破 AI 的平滑感。
 * 3. 词汇降级与特化：用具体的、俚语化的词汇代替抽象的、宏大的 AI 词汇。
 */

// 初始化 Gemini API
export const generateStoryOutline = async (
  originalText: string,
  layoutRefText: string,
  styleRefText: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    任务：创作一份 2000 - 3000 字的漫剧深度大纲。
    要求：**极高的人类叙事质感，彻底摆脱 AI 机械感。**

    【抗 AI 检测指令】：
    - **禁止宏大叙事**：不要用“这是一场关于...的较量”这种开场。直接切入具体的矛盾、具体的人、具体的物。
    - **句式突变**：长短句交错。用一个 5 字以内的短句紧接一个 30 字以上的长句，模拟人类的情绪波动。
    - **禁用逻辑词**：严禁出现“由于、结果、显而易见、不得不说”这类逻辑连接词，用动作的先后顺序自然驱动剧情。
    - **词汇新鲜度**：避开 AI 常用词（如：羁绊、救赎、蜕变、绽放）。用更接地气、更有痛感的动词。

    【排版指纹】：
    - 分析参考文件符号：${layoutRefText || '标准格式'}
    - 严禁任何 Markdown 标记。

    核心目标：
    1. 【总集数建议】：第一行给出（60-80集）。
    2. 【文笔参考】：${styleRefText}
    3. 【原著精髓】：${originalText.substring(0, 8000)}

    输出：纯文本，拒绝 AI 腔调。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.9, // 调高温度增加随机性
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  return response.text;
};

export const generateScriptSegment = async (
  batchIndex: number,
  mode: 'male' | 'female',
  originalText: string,
  outlineText: string,
  previousScripts: string,
  layoutRefText: string,
  styleRefText: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';

  const startEp = (batchIndex - 1) * 3 + 1;
  const endEp = batchIndex * 3;
  const contextHistory = previousScripts ? previousScripts.substring(previousScripts.length - 12000) : '这是开篇第一段';

  const prompt = `
    任务：编写动漫脚本 第 ${startEp} - ${endEp} 集。
    当前频道：${mode === 'male' ? '男频' : '女频'}
    
    【核心：去AI化书写（DE-AI PROTOCOL）】：
    1. **拒绝匀速感**：AI 喜欢平稳叙事。你要学会“留白”和“突进”。
    2. **动作切片化**：不要写“他愤怒地走进屋子”，要写“门被撞在墙上。他靴子踩在碎玻璃上，咯吱响。眼神像刀子。”
    3. **屏蔽 AI 转场词**：禁止出现“突然间”、“紧接着”、“说时迟那时快”、“与此同时”。直接切换场景描写。
    4. **标点个性化**：根据情绪使用省略号和破折号。不要每一句都是标准的“主谓宾+句号”。
    5. **词汇避雷针**：严禁使用“那一刻、空气似乎、命运的轮盘、无声的抗议、眸子里闪过...”这类 AI 常用陈词滥调。

    【上下文无缝衔接】：
    - 严格承接上一段结尾状态：${contextHistory.substring(contextHistory.length - 2000)}
    - 确保第 ${startEp} 集开头就是上一秒的延续。

    【排版与文笔指纹】：
    - 格式模版：${layoutRefText}
    - 文笔风格：${styleRefText}
    - 原著核心：${originalText.substring(0, 8000)}
    - 剧情大纲：${outlineText.substring(0, 3000)}

    输出：中文纯文本。追求极致的爽感与人类书写的灵动感，彻底通过 AI 检测。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.9, // 高温有助于产生更独特的词汇组合
      topP: 0.95,
      thinkingConfig: { thinkingBudget: 5000 }
    }
  });

  return response.text;
};
