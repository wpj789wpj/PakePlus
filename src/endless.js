// 无尽模式游戏逻辑

class EndlessMode {
    constructor() {
        this.level = 1;
        this.playerTeam = [];
        this.currentPlayerIndex = 0;
        this.currentEnemy = null;
        this.battleLog = [];
        this.gameState = 'selecting'; // selecting, battling, levelup, gameover
        this.init();
    }

    init() {
        this.loadPlayerTeam();
        this.updateTeamCount();
        this.setupEventListeners();
        
        if (this.playerTeam.length > 0) {
            // 确保第一个角色是存活的
            this.currentPlayerIndex = this.getFirstAliveCharacterIndex();
            if (this.currentPlayerIndex !== -1) {
                this.startBattle();
            } else {
                this.addToBattleLog("没有存活的角色，无法开始战斗！");
            }
        }
    }

    getFirstAliveCharacterIndex() {
        for (let i = 0; i < this.playerTeam.length; i++) {
            if (this.playerTeam[i].health > 0) {
                return i;
            }
        }
        return -1;
    }

    loadPlayerTeam() {
        // 从localStorage加载玩家队伍
        try {
            const savedTeam = localStorage.getItem('playerTeam');
            if (savedTeam) {
                this.playerTeam = JSON.parse(savedTeam);
            } else {
                // 默认使用前两个角色
                this.playerTeam = JSON.parse(JSON.stringify(window.game.characterTemplates.slice(0, 2)));
            }
        } catch (e) {
            console.error('加载队伍失败:', e);
            this.playerTeam = JSON.parse(JSON.stringify(window.game.characterTemplates.slice(0, 2)));
        }
    }

    updateTeamCount() {
        document.getElementById('team-count').textContent = this.playerTeam.filter(c => c.health > 0).length + "/" + this.playerTeam.length;
    }

    setupEventListeners() {
        // 可以添加额外的事件监听器
    }

    startBattle() {
        this.spawnEnemy();
        this.updateUI();
        this.gameState = 'battling';
        this.addToBattleLog(`第 ${this.level} 关开始！`);
        this.addToBattleLog(`遇到敌人 ${this.currentEnemy.name}！`);
    }

    spawnEnemy() {
        // 生成敌人，难度随关卡递增
        const enemyTemplate = {...window.game.characterTemplates[Math.floor(Math.random() * window.game.characterTemplates.length)]};
        
        // 根据关卡增加敌人属性
        const levelMultiplier = 1 + (this.level - 1) * 0.15; // 降低难度增长速度
        enemyTemplate.maxHealth = Math.floor(enemyTemplate.maxHealth * levelMultiplier);
        enemyTemplate.health = enemyTemplate.maxHealth;
        enemyTemplate.maxMana = Math.floor(enemyTemplate.maxMana * levelMultiplier);
        enemyTemplate.mana = enemyTemplate.maxMana;
        enemyTemplate.maxRage = 100; // 怒气值上限固定
        enemyTemplate.rage = 0;
        enemyTemplate.attack = Math.floor(enemyTemplate.attack * levelMultiplier);
        enemyTemplate.defense = Math.floor(enemyTemplate.defense * levelMultiplier);
        
        this.currentEnemy = enemyTemplate;
    }

    updateUI() {
        this.updateLevelDisplay();
        this.updatePlayerDisplay();
        this.updateEnemyDisplay();
        this.updateSkillsDisplay();
        this.updateBattleLog();
    }

    updateLevelDisplay() {
        document.getElementById('level').textContent = this.level;
    }

    updatePlayerDisplay() {
        if (this.playerTeam.length === 0 || this.currentPlayerIndex === -1) return;
        
        const player = this.playerTeam[this.currentPlayerIndex];
        document.getElementById('player-character').innerHTML = `<span style="color: ${window.game.getTypeColor(player.type)}">${player.image || player.name.charAt(0)}</span>`;
        document.getElementById('player-name').textContent = `${player.name} (${window.game.formatType(player.type)})`;
        document.getElementById('player-health-text').textContent = `${player.health}/${player.maxHealth}`;
        document.getElementById('player-mana-text').textContent = `${player.mana}/${player.maxMana}`;
        
        // 显示怒气值
        const ragePercent = (player.rage / player.maxRage) * 100;
        document.getElementById('player-rage-text').textContent = `${player.rage}/${player.maxRage}`;
        document.getElementById('player-rage-bar').style.width = `${ragePercent}%`;
        
        const healthPercent = (player.health / player.maxHealth) * 100;
        const manaPercent = (player.mana / player.maxMana) * 100;
        
        document.getElementById('player-health-bar').style.width = `${healthPercent}%`;
        document.getElementById('player-mana-bar').style.width = `${manaPercent}%`;
    }

    updateEnemyDisplay() {
        if (!this.currentEnemy) return;
        
        document.getElementById('enemy-character').innerHTML = `<span style="color: ${window.game.getTypeColor(this.currentEnemy.type)}">${this.currentEnemy.image || this.currentEnemy.name.charAt(0)}</span>`;
        document.getElementById('enemy-name').textContent = `${this.currentEnemy.name} (${window.game.formatType(this.currentEnemy.type)})`;
        document.getElementById('enemy-health-text').textContent = `${this.currentEnemy.health}/${this.currentEnemy.maxHealth}`;
        
        // 显示怒气值
        const ragePercent = (this.currentEnemy.rage / this.currentEnemy.maxRage) * 100;
        document.getElementById('enemy-rage-text').textContent = `${this.currentEnemy.rage}/${this.currentEnemy.maxRage}`;
        document.getElementById('enemy-rage-bar').style.width = `${ragePercent}%`;
        
        const healthPercent = (this.currentEnemy.health / this.currentEnemy.maxHealth) * 100;
        document.getElementById('enemy-health-bar').style.width = `${healthPercent}%`;
    }

    updateSkillsDisplay() {
        const container = document.getElementById('skills-container');
        container.innerHTML = '';
        
        if (this.playerTeam.length === 0 || this.currentPlayerIndex === -1) return;
        
        const player = this.playerTeam[this.currentPlayerIndex];
        
        // 添加普通攻击按钮
        const normalAttackBtn = document.createElement('button');
        normalAttackBtn.className = 'skill-btn';
        normalAttackBtn.innerHTML = `
            <div>普通攻击</div>
            <div>基础攻击</div>
        `;
        normalAttackBtn.addEventListener('click', () => {
            this.useNormalAttack();
        });
        container.appendChild(normalAttackBtn);
        
        // 添加技能按钮
        player.skills.forEach(skillId => {
            const skill = window.game.skillTemplates.find(s => s.id === skillId);
            if (!skill) return;
            
            const skillBtn = document.createElement('button');
            skillBtn.className = 'skill-btn';
            
            // 计算属性克制关系
            let effectivenessText = '';
            if (skill.type !== "none") {
                const effectiveness = window.game.typeEffectiveness[skill.type][this.currentEnemy.type];
                if (effectiveness > 1) {
                    effectivenessText = ' (效果拔群!)';
                } else if (effectiveness < 1 && effectiveness > 0) {
                    effectivenessText = ' (效果不理想)';
                } else if (effectiveness === 0) {
                    effectivenessText = ' (无效)';
                }
            }
            
            skillBtn.innerHTML = `
                <div>${skill.name} <span style="color: ${window.game.getTypeColor(skill.type)}">(${window.game.formatType(skill.type)})</span></div>
                <div>威力: ${skill.power} | 消耗: ${skill.manaCost}${effectivenessText}</div>
            `;
            
            // 检查魔法值是否足够
            if (player.mana < skill.manaCost) {
                skillBtn.disabled = true;
            }
            
            skillBtn.addEventListener('click', () => {
                this.useSkill(skill);
            });
            
            container.appendChild(skillBtn);
        });
        
        // 添加大招按钮
        player.ultimates.forEach(ultimateId => {
            const ultimate = window.game.ultimateTemplates.find(u => u.id === ultimateId);
            if (!ultimate) return;
            
            const ultimateBtn = document.createElement('button');
            ultimateBtn.className = 'skill-btn';
            
            // 计算属性克制关系
            let effectivenessText = '';
            if (ultimate.type !== "none") {
                const effectiveness = window.game.typeEffectiveness[ultimate.type][this.currentEnemy.type];
                if (effectiveness > 1) {
                    effectivenessText = ' (效果拔群!)';
                } else if (effectiveness < 1 && effectiveness > 0) {
                    effectivenessText = ' (效果不理想)';
                } else if (effectiveness === 0) {
                    effectivenessText = ' (无效)';
                }
            }
            
            ultimateBtn.innerHTML = `
                <div>${ultimate.name} <span style="color: ${window.game.getTypeColor(ultimate.type)}">(${window.game.formatType(ultimate.type)})</span></div>
                <div>威力: ${ultimate.power} | 怒气: ${ultimate.rageCost}${effectivenessText}</div>
            `;
            
            // 检查怒气值是否足够
            if (player.rage < ultimate.rageCost) {
                ultimateBtn.disabled = true;
                ultimateBtn.style.background = 'rgba(100, 100, 100, 0.3)';
            } else {
                ultimateBtn.style.background = 'linear-gradient(to right, #ff0000, #ff9900)';
            }
            
            ultimateBtn.addEventListener('click', () => {
                this.useUltimate(ultimate);
            });
            
            container.appendChild(ultimateBtn);
        });
        
        // 添加切换角色按钮（当队伍中有多个存活角色时）
        const aliveCharacters = this.playerTeam.filter(c => c.health > 0);
        if (aliveCharacters.length > 1) {
            const switchBtn = document.createElement('button');
            switchBtn.className = 'skill-btn';
            switchBtn.innerHTML = `
                <div>切换角色</div>
                <div>切换到下一个角色</div>
            `;
            switchBtn.addEventListener('click', () => {
                this.switchCharacter();
            });
            container.appendChild(switchBtn);
        }
    }

    switchCharacter() {
        if (this.gameState !== 'battling') return;
        
        // 寻找下一个存活的角色
        let nextIndex = this.currentPlayerIndex;
        do {
            nextIndex = (nextIndex + 1) % this.playerTeam.length;
        } while (this.playerTeam[nextIndex].health <= 0 && nextIndex !== this.currentPlayerIndex);
        
        // 如果找到了不同的存活角色，则切换
        if (nextIndex !== this.currentPlayerIndex && this.playerTeam[nextIndex].health > 0) {
            this.currentPlayerIndex = nextIndex;
            this.addToBattleLog(`${this.playerTeam[this.currentPlayerIndex].name} 上场了！`);
            this.updateUI();
        } else {
            this.addToBattleLog("没有其他存活的角色可以切换！");
        }
    }

    useNormalAttack() {
        if (this.gameState !== 'battling') return;
        
        const player = this.playerTeam[this.currentPlayerIndex];
        
        // 普通攻击不消耗魔法值，固定威力为角色攻击力的一半
        const normalSkill = {
            name: "普通攻击",
            type: player.type,
            power: Math.floor(player.attack * 0.5)
        };
        
        // 计算伤害
        const damage = window.game.calculateDamage(player, this.currentEnemy, normalSkill);
        
        // 应用伤害
        this.currentEnemy.health -= damage;
        this.currentEnemy.health = Math.max(0, this.currentEnemy.health);
        
        // 增加怒气值
        const rageGain = Math.floor(damage * 0.2);
        player.rage = Math.min(player.maxRage, player.rage + rageGain);
        
        this.addToBattleLog(`${player.name} 使用了普通攻击，对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害！获得 ${rageGain} 点怒气！`);
        
        // 检查敌人是否被击败
        if (this.currentEnemy.health <= 0) {
            this.handleEnemyDefeat();
            return;
        }
        
        // 敌人反击
        this.enemyAttack();
        
        // 回复魔法值
        this.regenMana();
        
        // 更新UI
        this.updateUI();
    }

    useSkill(skill) {
        if (this.gameState !== 'battling') return;
        
        const player = this.playerTeam[this.currentPlayerIndex];
        
        // 检查魔法值是否足够
        if (player.mana < skill.manaCost) {
            this.addToBattleLog(`${player.name} 的魔法值不足！`);
            return;
        }
        
        // 消耗魔法值
        player.mana -= skill.manaCost;
        
        // 处理治疗效果
        if (skill.heal) {
            player.health = Math.min(player.maxHealth, player.health + skill.heal);
            this.addToBattleLog(`${player.name} 使用了 ${skill.name}，恢复了 ${skill.heal} 点生命值！`);
        }
        
        // 处理持续伤害效果
        if (skill.dot) {
            // 简化处理，直接造成伤害
            const dotDamage = skill.dot * (skill.dotDuration || 1);
            this.currentEnemy.health -= dotDamage;
            this.currentEnemy.health = Math.max(0, this.currentEnemy.health);
            this.addToBattleLog(`${player.name} 使用了 ${skill.name}，对 ${this.currentEnemy.name} 造成了 ${dotDamage} 点持续伤害！`);
        }
        
        // 处理生命偷取效果
        let lifestealAmount = 0;
        if (skill.lifesteal) {
            lifestealAmount = Math.floor(skill.lifesteal * (skill.power || 0));
            player.health = Math.min(player.maxHealth, player.health + lifestealAmount);
        }
        
        // 处理团队治疗效果
        if (skill.teamHeal) {
            this.playerTeam.forEach(character => {
                if (character.health > 0) {
                    character.health = Math.min(character.maxHealth, character.health + skill.teamHeal);
                }
            });
            this.addToBattleLog(`${player.name} 使用了 ${skill.name}，回复了所有队友 ${skill.teamHeal} 点生命值！`);
        }
        
        // 处理护盾效果
        if (skill.shield) {
            // 护盾效果简化处理为直接恢复一定比例的生命值
            const shieldValue = Math.floor(player.maxHealth * skill.shield);
            player.health = Math.min(player.maxHealth, player.health + shieldValue);
            this.addToBattleLog(`${player.name} 使用了 ${skill.name}，获得了 ${shieldValue} 点护盾效果！`);
        }
        
        // 处理眩晕效果
        let isStunned = false;
        if (skill.stun) {
            isStunned = true;
            this.addToBattleLog(`${this.currentEnemy.name} 被 ${skill.name} 眩晕了！`);
        }
        
        // 处理净化效果
        if (skill.purge) {
            this.addToBattleLog(`${player.name} 使用了 ${skill.name}，净化了负面效果！`);
        }
        
        // 处理反射伤害效果
        if (skill.reflect) {
            this.addToBattleLog(`${player.name} 使用了 ${skill.name}，获得了 ${Math.floor(skill.reflect * 100)}% 伤害反射效果！`);
        }
        
        // 计算伤害
        if (skill.power > 0) {
            const damage = window.game.calculateDamage(player, this.currentEnemy, skill);
            
            // 应用伤害
            this.currentEnemy.health -= damage;
            this.currentEnemy.health = Math.max(0, this.currentEnemy.health);
            
            // 处理生命偷取
            if (skill.lifesteal) {
                const actualLifesteal = Math.floor(damage * skill.lifesteal);
                player.health = Math.min(player.maxHealth, player.health + actualLifesteal);
                this.addToBattleLog(`${player.name} 使用了 ${skill.name}，对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害，并偷取了 ${actualLifesteal} 点生命值！`);
            } else {
                this.addToBattleLog(`${player.name} 使用了 ${skill.name}，对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害！`);
            }
        }
        
        // 对于只有效果没有伤害的技能
        if (skill.power <= 0 && !skill.heal && !skill.dot && !skill.teamHeal && !skill.shield) {
            if (skill.name) {
                this.addToBattleLog(`${player.name} 使用了 ${skill.name}！`);
            }
        }
        
        // 增加怒气值
        const rageGain = Math.floor((skill.power + (skill.heal || 0)) * 0.3);
        player.rage = Math.min(player.maxRage, player.rage + rageGain);
        
        // 检查敌人是否被击败
        if (this.currentEnemy.health <= 0) {
            this.handleEnemyDefeat();
            return;
        }
        
        // 敌人反击（除非被眩晕）
        if (!isStunned) {
            this.enemyAttack();
        } else {
            // 回复魔法值
            this.regenMana();
            
            // 更新UI
            this.updateUI();
        }
        
        // 回复魔法值
        this.regenMana();
        
        // 更新UI
        this.updateUI();
    }

    useUltimate(ultimate) {
        if (this.gameState !== 'battling') return;
        
        const player = this.playerTeam[this.currentPlayerIndex];
        
        // 检查怒气值是否足够
        if (player.rage < ultimate.rageCost) {
            this.addToBattleLog(`${player.name} 的怒气值不足！`);
            return;
        }
        
        // 消耗怒气值
        player.rage -= ultimate.rageCost;
        
        // 计算伤害
        let damage = 0;
        let isStunned = false;
        if (ultimate.power > 0) {
            damage = window.game.calculateDamage(player, this.currentEnemy, ultimate);
            
            // 应用伤害
            this.currentEnemy.health -= damage;
            this.currentEnemy.health = Math.max(0, this.currentEnemy.health);
        }
        
        // 处理治疗效果
        if (ultimate.heal) {
            player.health = Math.min(player.maxHealth, player.health + ultimate.heal);
            this.addToBattleLog(`${player.name} 使用了 ${ultimate.name}，对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害，并恢复了 ${ultimate.heal} 点生命值！`);
        } 
        // 处理团队治疗效果
        else if (ultimate.teamHeal) {
            this.playerTeam.forEach(character => {
                if (character.health > 0) {
                    character.health = Math.min(character.maxHealth, character.health + ultimate.teamHeal);
                }
            });
            this.addToBattleLog(`${player.name} 使用了 ${ultimate.name}，对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害，并回复了所有队友 ${ultimate.teamHeal} 点生命值！`);
        }
        // 处理复活效果
        else if (ultimate.revive) {
            let revivedCount = 0;
            this.playerTeam.forEach(character => {
                if (character.health <= 0) {
                    character.health = Math.floor(character.maxHealth * 0.5); // 复活时恢复50%生命值
                    revivedCount++;
                }
            });
            this.addToBattleLog(`${player.name} 使用了 ${ultimate.name}，复活了 ${revivedCount} 名死亡的队友并恢复了50%生命值！`);
        }
        // 处理护盾效果
        else if (ultimate.shield) {
            const shieldValue = Math.floor(player.maxHealth * ultimate.shield);
            player.health = Math.min(player.maxHealth, player.health + shieldValue);
            this.addToBattleLog(`${player.name} 使用了 ${ultimate.name}，获得了 ${shieldValue} 点护盾效果！`);
        }
        // 处理眩晕效果
        else if (ultimate.stun) {
            isStunned = true;
            this.addToBattleLog(`${this.currentEnemy.name} 被 ${ultimate.name} 眩晕了！`);
        }
        // 处理净化效果
        else if (ultimate.purge) {
            this.addToBattleLog(`${player.name} 使用了 ${ultimate.name}，净化了所有负面效果！`);
        }
        // 处理生命偷取效果
        else if (ultimate.lifesteal) {
            const lifestealAmount = Math.floor(damage * ultimate.lifesteal);
            player.health = Math.min(player.maxHealth, player.health + lifestealAmount);
            this.addToBattleLog(`${player.name} 使用了 ${ultimate.name}，对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害，并偷取了 ${lifestealAmount} 点生命值！`);
        }
        // 普通伤害效果
        else {
            this.addToBattleLog(`${player.name} 使用了 ${ultimate.name}，对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害！`);
        }
        
        // 检查敌人是否被击败
        if (this.currentEnemy.health <= 0) {
            this.handleEnemyDefeat();
            return;
        }
        
        // 敌人反击（除非被眩晕）
        if (!isStunned) {
            this.enemyAttack();
        } else {
            // 回复魔法值
            this.regenMana();
            
            // 更新UI
            this.updateUI();
        }
        
        // 回复魔法值
        this.regenMana();
        
        // 更新UI
        this.updateUI();
    }

    handleEnemyDefeat() {
        this.addToBattleLog(`${this.currentEnemy.name} 被击败了！`);
        
        // 使用setTimeout避免卡顿，确保日志先显示
        setTimeout(() => {
            this.levelUp();
        }, 500);
    }

    enemyAttack() {
        if (!this.currentEnemy || this.currentEnemy.health <= 0) return;
        
        // 简单的敌人AI：随机选择技能
        const availableSkills = window.game.skillTemplates.filter(skill => 
            this.currentEnemy.skills && this.currentEnemy.skills.includes(skill.id));
        
        // 敌人有70%概率使用技能，30%概率使用普通攻击
        if (availableSkills.length > 0 && Math.random() < 0.7) {
            const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            
            // 检查魔法值是否足够
            if (this.currentEnemy.mana < skill.manaCost) {
                // 魔法值不足时使用普通攻击
                this.enemyNormalAttack();
                return;
            }
            
            // 消耗魔法值
            this.currentEnemy.mana -= skill.manaCost;
            
            // 处理治疗效果
            if (skill.heal) {
                this.currentEnemy.health = Math.min(this.currentEnemy.maxHealth, this.currentEnemy.health + skill.heal);
                this.addToBattleLog(`${this.currentEnemy.name} 使用了 ${skill.name}，恢复了 ${skill.heal} 点生命值！`);
            }
            
            // 处理持续伤害效果
            if (skill.dot) {
                // 简化处理，直接造成伤害
                const dotDamage = skill.dot * (skill.dotDuration || 1);
                const player = this.playerTeam[this.currentPlayerIndex];
                player.health -= dotDamage;
                player.health = Math.max(0, player.health);
                this.addToBattleLog(`${this.currentEnemy.name} 使用了 ${skill.name}，对 ${player.name} 造成了 ${dotDamage} 点持续伤害！`);
            }
            
            // 处理生命偷取效果
            let lifestealAmount = 0;
            if (skill.lifesteal) {
                lifestealAmount = Math.floor(skill.lifesteal * (skill.power || 0));
                this.currentEnemy.health = Math.min(this.currentEnemy.maxHealth, this.currentEnemy.health + lifestealAmount);
            }
            
            // 处理团队治疗效果
            if (skill.teamHeal) {
                // 敌人没有队友，所以这里不处理
            }
            
            // 处理护盾效果
            if (skill.shield) {
                // 护盾效果简化处理为直接恢复一定比例的生命值
                const shieldValue = Math.floor(this.currentEnemy.maxHealth * skill.shield);
                this.currentEnemy.health = Math.min(this.currentEnemy.maxHealth, this.currentEnemy.health + shieldValue);
                this.addToBattleLog(`${this.currentEnemy.name} 使用了 ${skill.name}，获得了 ${shieldValue} 点护盾效果！`);
            }
            
            // 处理眩晕效果
            let isStunned = false;
            if (skill.stun) {
                isStunned = true;
                this.addToBattleLog(`${this.playerTeam[this.currentPlayerIndex].name} 被 ${skill.name} 眩晕了！`);
            }
            
            // 处理净化效果
            if (skill.purge) {
                this.addToBattleLog(`${this.currentEnemy.name} 使用了 ${skill.name}，净化了负面效果！`);
            }
            
            // 处理反射伤害效果
            if (skill.reflect) {
                this.addToBattleLog(`${this.currentEnemy.name} 使用了 ${skill.name}，获得了 ${Math.floor(skill.reflect * 100)}% 伤害反射效果！`);
            }
            
            // 计算伤害
            if (skill.power > 0) {
                const damage = window.game.calculateDamage(this.currentEnemy, this.playerTeam[this.currentPlayerIndex], skill);
                
                // 应用伤害
                const player = this.playerTeam[this.currentPlayerIndex];
                player.health -= damage;
                player.health = Math.max(0, player.health);
                
                // 处理生命偷取
                if (skill.lifesteal) {
                    const actualLifesteal = Math.floor(damage * skill.lifesteal);
                    this.currentEnemy.health = Math.min(this.currentEnemy.maxHealth, this.currentEnemy.health + actualLifesteal);
                    this.addToBattleLog(`${this.currentEnemy.name} 使用了 ${skill.name}，对 ${player.name} 造成了 ${damage} 点伤害，并偷取了 ${actualLifesteal} 点生命值！`);
                } else {
                    this.addToBattleLog(`${this.currentEnemy.name} 使用了 ${skill.name}，对 ${player.name} 造成了 ${damage} 点伤害！`);
                }
            }
            
            // 对于只有效果没有伤害的技能
            if (skill.power <= 0 && !skill.heal && !skill.dot && !skill.teamHeal && !skill.shield) {
                if (skill.name) {
                    this.addToBattleLog(`${this.currentEnemy.name} 使用了 ${skill.name}！`);
                }
            }
            
            // 增加怒气值
            const rageGain = Math.floor((skill.power + (skill.heal || 0)) * 0.3);
            this.currentEnemy.rage = Math.min(this.currentEnemy.maxRage, this.currentEnemy.rage + rageGain);
            
            // 玩家角色反击（除非被眩晕）
            if (!isStunned) {
                // 检查玩家角色是否被击败
                if (this.playerTeam[this.currentPlayerIndex].health <= 0) {
                    this.addToBattleLog(`${this.playerTeam[this.currentPlayerIndex].name} 被击败了！`);
                    this.checkPlayerTeam();
                }
            } else {
                // 更新UI
                this.updateUI();
            }
            
            return;
        } else {
            this.enemyNormalAttack();
        }
        
        // 检查玩家角色是否被击败
        if (this.playerTeam[this.currentPlayerIndex].health <= 0) {
            this.addToBattleLog(`${this.playerTeam[this.currentPlayerIndex].name} 被击败了！`);
            this.checkPlayerTeam();
        }
    }

    enemyNormalAttack() {
        // 敌人普通攻击
        const player = this.playerTeam[this.currentPlayerIndex];
        const normalSkill = {
            name: "普通攻击",
            type: this.currentEnemy.type,
            power: Math.floor(this.currentEnemy.attack * 0.5)
        };
        
        // 计算伤害
        const damage = window.game.calculateDamage(this.currentEnemy, player, normalSkill);
        
        // 应用伤害
        player.health -= damage;
        player.health = Math.max(0, player.health);
        
        // 增加怒气值
        const rageGain = Math.floor(damage * 0.2);
        this.currentEnemy.rage = Math.min(this.currentEnemy.maxRage, this.currentEnemy.rage + rageGain);
        
        this.addToBattleLog(`${this.currentEnemy.name} 使用了普通攻击，对 ${player.name} 造成了 ${damage} 点伤害！获得 ${rageGain} 点怒气！`);
        
        // 检查玩家角色是否被击败
        if (player.health <= 0) {
            this.addToBattleLog(`${player.name} 被击败了！`);
            this.checkPlayerTeam();
        } else {
            // 更新UI（如果玩家未被击败）
            this.updateUI();
        }
    }

    checkPlayerTeam() {
        // 检查是否还有存活的角色
        const aliveCharacters = this.playerTeam.filter(character => character.health > 0);
        
        if (aliveCharacters.length === 0) {
            // 所有角色都被击败，游戏结束
            this.addToBattleLog("所有角色都被击败，游戏结束！");
            this.gameState = 'gameover';
            // 显示游戏结束信息
            document.getElementById('level-up-modal').style.display = 'block';
            document.getElementById('choices-container').innerHTML = '<h2>游戏结束</h2><p>所有角色都被击败了！</p><button onclick="window.location.reload()">重新开始</button>';
            return;
        }
        
        // 切换到下一个存活的角色
        let nextIndex = this.currentPlayerIndex;
        do {
            nextIndex = (nextIndex + 1) % this.playerTeam.length;
        } while (this.playerTeam[nextIndex].health <= 0 && nextIndex !== this.currentPlayerIndex);
        
        if (this.playerTeam[nextIndex].health > 0 && nextIndex !== this.currentPlayerIndex) {
            this.currentPlayerIndex = nextIndex;
            this.addToBattleLog(`${this.playerTeam[this.currentPlayerIndex].name} 上场了！`);
        }
        
        // 更新UI
        this.updateUI();
    }

    regenMana() {
        // 回复魔法值
        this.playerTeam.forEach(character => {
            // 只为存活的角色回复魔法值
            if (character.health > 0) {
                // 基础回复
                character.mana = Math.min(character.maxMana, character.mana + 2);
                
                // 被动技能回复
                if (character.manaRegen) {
                    const regen = window.game.manaRegenTemplates.find(m => m.id === character.manaRegen);
                    if (regen) {
                        character.mana = Math.min(character.maxMana, character.mana + regen.rate);
                        // 光之源泉额外回复生命值
                        if (regen.id === 4 && regen.rate === 4) {
                            character.health = Math.min(character.maxHealth, character.health + 1);
                        }
                        // 森林之心额外回复生命值
                        if (regen.id === 10 && regen.rate === 5) {
                            character.health = Math.min(character.maxHealth, character.health + Math.floor(character.maxHealth * 0.01));
                        }
                    }
                }
            }
        });
        
        // 敌人回复魔法值
        if (this.currentEnemy) {
            this.currentEnemy.mana = Math.min(this.currentEnemy.maxMana, this.currentEnemy.mana + 2);
        }
    }

    levelUp() {
        this.level++;
        this.gameState = 'levelup';
        
        // 每2关显示三选一（加快频率）
        if (this.level % 2 === 1) {
            this.showLevelUpChoices();
        } else {
            // 不需要选择强化时，直接开始下一关
            setTimeout(() => {
                this.startBattle();
            }, 1500);
        }
    }

    showLevelUpChoices() {
        const modal = document.getElementById('level-up-modal');
        const container = document.getElementById('choices-container');
        container.innerHTML = '';
        
        // 生成十个选择项（增加7个选项）
        const choices = [
            { 
                type: 'health', 
                title: '增强生命值', 
                description: '所有角色最大生命值+5%',
                apply: (team) => {
                    team.forEach(character => {
                        character.maxHealth = Math.floor(character.maxHealth * 1.05);
                        // 同时按比例恢复当前生命值
                        character.health = Math.floor(character.health * 1.05);
                    });
                    this.addToBattleLog('所有角色生命值增强！');
                }
            },
            { 
                type: 'attack', 
                title: '增强攻击力', 
                description: '所有角色攻击力+4%',
                apply: (team) => {
                    team.forEach(character => {
                        character.attack = Math.floor(character.attack * 1.04);
                    });
                    this.addToBattleLog('所有角色攻击力增强！');
                }
            },
            { 
                type: 'defense', 
                title: '增强防御力', 
                description: '所有角色防御力+4%',
                apply: (team) => {
                    team.forEach(character => {
                        character.defense = Math.floor(character.defense * 1.04);
                    });
                    this.addToBattleLog('所有角色防御力增强！');
                }
            },
            { 
                type: 'mana', 
                title: '增强魔法值', 
                description: '所有角色最大魔法值+5%',
                apply: (team) => {
                    team.forEach(character => {
                        character.maxMana = Math.floor(character.maxMana * 1.05);
                        // 同时按比例恢复当前魔法值
                        character.mana = Math.floor(character.mana * 1.05);
                    });
                    this.addToBattleLog('所有角色魔法值增强！');
                }
            },
            { 
                type: 'rage', 
                title: '增强怒气回复', 
                description: '所有角色攻击和受到伤害时获得额外5%怒气',
                apply: (team) => {
                    // 这个效果在实际战斗中体现，这里只记录日志
                    this.addToBattleLog('所有角色怒气回复增强！');
                }
            },
            { 
                type: 'skill', 
                title: '学习新技能', 
                description: '从技能库中随机学习一个新技能',
                apply: (team) => {
                    if (team.length > 0) {
                        const newSkill = window.game.skillTemplates[Math.floor(Math.random() * window.game.skillTemplates.length)];
                        // 确保不重复添加技能
                        if (!team[0].skills.includes(newSkill.id)) {
                            team[0].skills.push(newSkill.id);
                            this.addToBattleLog(`${team[0].name} 学会了新技能 ${newSkill.name}！`);
                        } else {
                            // 如果技能已存在，增加一点生命值作为补偿
                            team[0].maxHealth += 5;
                            team[0].health += 5;
                            this.addToBattleLog(`${team[0].name} 生命值增加5点！`);
                        }
                    }
                }
            },
            { 
                type: 'revive', 
                title: '复活队友', 
                description: '复活所有死亡的队友并恢复20%生命值',
                apply: (team) => {
                    let revivedCount = 0;
                    team.forEach(character => {
                        if (character.health <= 0) {
                            character.health = Math.floor(character.maxHealth * 0.2);
                            revivedCount++;
                        }
                    });
                    if (revivedCount > 0) {
                        this.addToBattleLog(`复活了 ${revivedCount} 名队友并恢复了20%生命值！`);
                    } else {
                        // 如果没有死亡的队友，则增强所有角色的生命值
                        team.forEach(character => {
                            character.maxHealth = Math.floor(character.maxHealth * 1.03);
                            character.health = Math.floor(character.health * 1.03);
                        });
                        this.addToBattleLog('所有角色生命值增强3%！');
                    }
                }
            },
            { 
                type: 'teamhealth', 
                title: '回复队友', 
                description: '恢复所有队友50%生命值',
                apply: (team) => {
                    let healedCount = 0;
                    team.forEach(character => {
                        if (character.health > 0) { // 只治疗存活的角色
                            const healAmount = Math.floor(character.maxHealth * 0.5);
                            character.health = Math.min(character.maxHealth, character.health + healAmount);
                            healedCount++;
                        }
                    });
                    this.addToBattleLog(`回复了 ${healedCount} 名队友50%生命值！`);
                }
            },
            { 
                type: 'fullheal', 
                title: '全体治愈', 
                description: '完全恢复所有队友生命值',
                apply: (team) => {
                    team.forEach(character => {
                        if (character.health > 0) { // 只治疗存活的角色
                            character.health = character.maxHealth;
                        }
                    });
                    this.addToBattleLog('完全恢复了所有队友生命值！');
                }
            },
            { 
                type: 'manaregen', 
                title: '魔力恢复', 
                description: '恢复所有队友50%魔法值',
                apply: (team) => {
                    team.forEach(character => {
                        if (character.health > 0) { // 只治疗存活的角色
                            const manaAmount = Math.floor(character.maxMana * 0.5);
                            character.mana = Math.min(character.maxMana, character.mana + manaAmount);
                        }
                    });
                    this.addToBattleLog('恢复了所有队友50%魔法值！');
                }
            }
        ];
        
        // 随机选择3个选项
        const selectedChoices = [];
        const availableChoices = [...choices];
        for (let i = 0; i < 3; i++) {
            if (availableChoices.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableChoices.length);
                selectedChoices.push(availableChoices[randomIndex]);
                availableChoices.splice(randomIndex, 1);
            }
        }
        
        selectedChoices.forEach(choice => {
            const card = document.createElement('div');
            card.className = 'choice-card';
            card.innerHTML = `
                <h3 class="choice-title">${choice.title}</h3>
                <p>${choice.description}</p>
            `;
            
            card.addEventListener('click', () => {
                choice.apply(this.playerTeam);
                // 隐藏模态框并开始下一关
                modal.style.display = 'none';
                setTimeout(() => {
                    this.startBattle();
                }, 1000);
            });
            
            container.appendChild(card);
        });
        
        modal.style.display = 'block';
    }

    addToBattleLog(message) {
        this.battleLog.push(message);
        this.updateBattleLog();
    }

    updateBattleLog() {
        const logContent = document.getElementById('battle-log-content');
        logContent.innerHTML = '';
        
        // 只显示最近的10条日志
        const recentLogs = this.battleLog.slice(-10);
        recentLogs.forEach(log => {
            const p = document.createElement('p');
            p.textContent = log;
            logContent.appendChild(p);
        });
        
        // 滚动到底部
        logContent.scrollTop = logContent.scrollHeight;
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    window.endlessGame = new EndlessMode();
});