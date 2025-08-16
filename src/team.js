// 队伍配置逻辑

class TeamManager {
    constructor() {
        this.team = []; // 当前队伍，最多4个角色
        this.availableCharacters = [...window.game.characterTemplates];
        this.maxTeamSize = 4;
        this.init();
    }

    init() {
        this.loadTeamFromStorage();
        this.loadAvailableCharactersFromStorage();
        this.renderTeamSlots();
        this.renderAvailableCharacters();
        this.updateTeamStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 上传角色按钮
        document.getElementById('upload-character-btn').addEventListener('click', () => {
            document.getElementById('upload-character').click();
        });

        // 上传角色文件
        document.getElementById('upload-character').addEventListener('change', (e) => {
            this.uploadCharacter(e);
        });

        // 上传队伍按钮
        document.getElementById('upload-team-btn').addEventListener('click', () => {
            document.getElementById('upload-team').click();
        });

        // 上传队伍文件
        document.getElementById('upload-team').addEventListener('change', (e) => {
            this.uploadTeam(e);
        });

        // 保存队伍按钮
        document.getElementById('save-team-btn').addEventListener('click', () => {
            this.saveTeam();
        });

        // 加载队伍按钮
        document.getElementById('load-team-btn').addEventListener('click', () => {
            this.loadTeam();
        });
    }

    uploadCharacter(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const character = JSON.parse(event.target.result);
                
                // 验证角色数据
                if (!character.name || !character.type) {
                    alert('无效的角色数据！');
                    return;
                }

                // 为角色分配ID（如果还没有）
                if (!character.id) {
                    character.id = this.getNextCharacterId();
                }

                // 添加到可用角色列表
                this.availableCharacters.push(character);
                this.saveAvailableCharactersToStorage();
                this.renderAvailableCharacters();
                alert(`角色 ${character.name} 上传成功！`);
            } catch (error) {
                alert('角色文件格式错误！');
            }
        };
        reader.readAsText(file);
    }

    uploadTeam(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const teamData = JSON.parse(event.target.result);
                
                // 验证队伍数据
                if (!Array.isArray(teamData) || teamData.length > this.maxTeamSize) {
                    alert('无效的队伍数据！');
                    return;
                }

                // 验证每个角色
                for (const character of teamData) {
                    if (!character.name || !character.type) {
                        alert('队伍中包含无效的角色数据！');
                        return;
                    }
                    
                    // 为角色分配ID（如果还没有）
                    if (!character.id) {
                        character.id = this.getNextCharacterId();
                    }
                }

                // 设置为当前队伍
                this.team = teamData;
                this.renderTeamSlots();
                this.updateTeamStats();
                this.saveTeamToStorage();
                alert('队伍上传成功！');
            } catch (error) {
                alert('队伍文件格式错误！');
            }
        };
        reader.readAsText(file);
    }

    getNextCharacterId() {
        // 获取下一个可用的角色ID
        const allCharacters = [...this.availableCharacters, ...this.team];
        const maxId = allCharacters.reduce((max, character) => 
            character.id > max ? character.id : max, 0);
        return maxId + 1;
    }

    saveTeam() {
        if (this.team.length === 0) {
            alert('队伍为空，无法保存！');
            return;
        }

        const teamData = JSON.stringify(this.team, null, 2);
        const blob = new Blob([teamData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-team.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('队伍保存成功！');
    }

    loadTeam() {
        // 在实际应用中，这会从服务器或localStorage加载
        // 这里我们只是显示一个提示
        alert('在实际应用中，这里会加载已保存的队伍。');
    }

    loadTeamFromStorage() {
        // 从localStorage加载队伍（如果存在）
        try {
            const savedTeam = localStorage.getItem('playerTeam');
            if (savedTeam) {
                this.team = JSON.parse(savedTeam);
            } else {
                // 默认添加前两个角色到队伍
                this.team = [...window.game.characterTemplates.slice(0, 2)];
            }
        } catch (e) {
            console.error('加载队伍失败:', e);
            this.team = [...window.game.characterTemplates.slice(0, 2)];
        }
    }

    saveTeamToStorage() {
        try {
            localStorage.setItem('playerTeam', JSON.stringify(this.team));
        } catch (e) {
            console.error('保存队伍失败:', e);
            alert('保存队伍失败！');
        }
    }

    loadAvailableCharactersFromStorage() {
        // 从localStorage加载可用角色（如果存在）
        try {
            const savedCharacters = localStorage.getItem('availableCharacters');
            if (savedCharacters) {
                this.availableCharacters = JSON.parse(savedCharacters);
            }
        } catch (e) {
            console.error('加载可用角色失败:', e);
        }
    }

    saveAvailableCharactersToStorage() {
        try {
            localStorage.setItem('availableCharacters', JSON.stringify(this.availableCharacters));
        } catch (e) {
            console.error('保存可用角色失败:', e);
        }
    }

    renderTeamSlots() {
        const container = document.getElementById('team-slots');
        container.innerHTML = '';

        for (let i = 0; i < this.maxTeamSize; i++) {
            const slot = document.createElement('div');
            slot.className = 'team-slot';
            
            if (this.team[i]) {
                // 有角色的栏位
                const character = this.team[i];
                slot.innerHTML = `
                    <div class="character-image" style="color: ${window.game.getTypeColor(character.type)}">
                        <span>${character.image || character.name.charAt(0)}</span>
                    </div>
                    <div class="character-name">${character.name}</div>
                    <div class="character-type">${window.game.formatType(character.type)}</div>
                    <button class="remove-btn" data-index="${i}">移除</button>
                `;
                
                const removeBtn = slot.querySelector('.remove-btn');
                removeBtn.addEventListener('click', (e) => {
                    this.removeCharacterFromTeam(i);
                });
            } else {
                // 空栏位
                slot.classList.add('empty');
                slot.innerHTML = `
                    <p>空位</p>
                `;
            }
            
            // 添加拖拽事件
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.style.background = 'rgba(255, 255, 255, 0.3)';
            });
            
            slot.addEventListener('dragleave', () => {
                slot.style.background = '';
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.style.background = '';
                
                const characterId = e.dataTransfer.getData('character-id');
                const character = this.availableCharacters.find(c => c.id == characterId);
                
                if (character) {
                    this.addCharacterToTeam(character, i);
                }
            });
            
            container.appendChild(slot);
        }
    }

    renderAvailableCharacters() {
        const container = document.getElementById('available-characters');
        container.innerHTML = '';

        this.availableCharacters.forEach(character => {
            const characterCard = document.createElement('div');
            characterCard.className = 'character-card';
            characterCard.draggable = true;
            characterCard.dataset.id = character.id;
            
            characterCard.innerHTML = `
                <div class="character-image" style="color: ${window.game.getTypeColor(character.type)}">
                    <span>${character.image || character.name.charAt(0)}</span>
                </div>
                <div class="character-name">${character.name}</div>
                <div class="character-type">${window.game.formatType(character.type)}</div>
                <div class="character-stats">
                    <div class="stat">
                        <div>生命</div>
                        <div class="stat-value">${character.health}</div>
                    </div>
                    <div class="stat">
                        <div>攻击</div>
                        <div class="stat-value">${character.attack}</div>
                    </div>
                </div>
            `;
            
            // 添加拖拽事件
            characterCard.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('character-id', character.id);
            });
            
            // 点击添加到队伍
            characterCard.addEventListener('click', () => {
                this.addCharacterToTeam(character);
            });
            
            container.appendChild(characterCard);
        });
    }

    addCharacterToTeam(character, position = null) {
        if (this.team.length >= this.maxTeamSize) {
            alert('队伍已满！');
            return;
        }

        // 检查角色是否已在队伍中
        if (this.team.some(c => c.id === character.id)) {
            alert('该角色已在队伍中！');
            return;
        }

        // 添加到指定位置或末尾
        const characterCopy = {...character};
        if (position !== null && position < this.maxTeamSize) {
            this.team[position] = characterCopy;
        } else {
            this.team.push(characterCopy);
        }

        this.renderTeamSlots();
        this.updateTeamStats();
        this.saveTeamToStorage();
    }

    removeCharacterFromTeam(index) {
        if (index >= 0 && index < this.team.length) {
            this.team.splice(index, 1);
            this.renderTeamSlots();
            this.updateTeamStats();
            this.saveTeamToStorage();
        }
    }

    updateTeamStats() {
        const container = document.getElementById('team-stats-content');
        
        if (this.team.length === 0) {
            container.innerHTML = '<p>队伍为空</p>';
            return;
        }

        // 计算队伍总属性
        let totalHealth = 0;
        let totalAttack = 0;
        let totalDefense = 0;
        const typeCount = {};

        this.team.forEach(character => {
            totalHealth += character.maxHealth;
            totalAttack += character.attack;
            totalDefense += character.defense;
            
            if (!typeCount[character.type]) {
                typeCount[character.type] = 0;
            }
            typeCount[character.type]++;
        });

        container.innerHTML = `
            <div class="team-stats-summary">
                <h4>队伍属性总览</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span>总生命值:</span>
                        <span class="stat-value">${totalHealth}</span>
                    </div>
                    <div class="stat-item">
                        <span>总攻击力:</span>
                        <span class="stat-value">${totalAttack}</span>
                    </div>
                    <div class="stat-item">
                        <span>总防御力:</span>
                        <span class="stat-value">${totalDefense}</span>
                    </div>
                    <div class="stat-item">
                        <span>队伍规模:</span>
                        <span class="stat-value">${this.team.length}/${this.maxTeamSize}</span>
                    </div>
                </div>
                
                <h4>属性分布</h4>
                <div class="type-distribution">
                    ${Object.entries(typeCount).map(([type, count]) => 
                        `<span class="type-badge" style="background: ${window.game.getTypeColor(type)}">
                            ${window.game.formatType(type)}: ${count}
                        </span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
}

// 页面加载完成后初始化队伍管理器
document.addEventListener('DOMContentLoaded', function() {
    window.teamManager = new TeamManager();
});