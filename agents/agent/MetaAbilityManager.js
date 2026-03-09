import { MetaAbility } from "./metaAbilities/MetaAbility.js";

export class MetaAbilityManager {
  constructor() {
    this.abilities = []; // 存放所有元能力实例
  }

  // 注册一个元能力实例
  register(metaAbilityInstance) {
    if (!(metaAbilityInstance instanceof MetaAbility)) {
      throw new Error("只能注册 MetaAbility 实例");
    }
    this.abilities.push(metaAbilityInstance);
  }

  // Tick 调用，遍历所有元能力
  async tickAll(context) {
    const tickPromises = this.abilities.map(ability => ability.tick(context));
    await Promise.allSettled(tickPromises);
  }

  // 结束所有元能力
  async endAll() {
    const endPromises = this.abilities.map(ability => ability.end());
    await Promise.allSettled(endPromises);
  }

  // 获取活跃元能力列表
  getActiveAbilities() {
    return this.abilities.filter(ability => ability.active);
  }
}