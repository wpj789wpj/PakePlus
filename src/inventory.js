// 背包界面逻辑

class Inventory {
    constructor() {
        this.characters = [];
        this.skills = [];
        this.passives = [];
        this.manaRegen = [];
        this.ultimates = [];
        this.currentLayout = 'grid'; // 'grid' or 'list'
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupTabNavigation();
        this.setupSearchFunctionality();
        this.setupLayoutControls();
        this.renderAllTabs();
    }

    loadFromStorage() {
        try {
            // 加载角色
            const savedCharacters = localStorage.getItem('customCharacters');
            if (savedCharacters) {
                this.characters = JSON.parse(savedCharacters);
            } else {
                this.characters = [...window.game.characterTemplates];
            }

            // 从角色中提取已拥有的技能、被动技能、回蓝机制和大招
            const ownedSkills = new Set();
            const ownedPassives = new Set();
            const ownedManaRegen = new Set();
            const ownedUltimates = new Set();

            this.characters.forEach(character => {
                // 收集技能
                if (character.skills) {
                    character.skills.forEach(skillId => ownedSkills.add(skillId));
                }

                // 收集被动技能
                if (character.passives) {
                    character.passives.forEach(passiveId => ownedPassives.add(passiveId));
                }

                // 收集回蓝机制
                if (character.manaRegen) {
                    ownedManaRegen.add(character.manaRegen);
                }

                // 收集大招
                if (character.ultimates) {
                    character.ultimates.forEach(ultimateId => ownedUltimates.add(ultimateId));
                }
            });

            // 根据ID过滤出实际的技能对象
            this.skills = window.game.skillTemplates.filter(skill => ownedSkills.has(skill.id));
            this.passives = window.game.passiveTemplates.filter(passive => ownedPassives.has(passive.id));
            this.manaRegen = window.game.manaRegenTemplates.filter(manaRegen => ownedManaRegen.has(manaRegen.id));
            this.ultimates = window.game.ultimateTemplates.filter(ultimate => ownedUltimates.has(ultimate.id));
        } catch (e) {
            console.error('加载背包数据失败:', e);
            this.characters = [...window.game.characterTemplates];
            this.skills = [...window.game.skillTemplates];
            this.passives = [...window.game.passiveTemplates];
            this.manaRegen = [...window.game.manaRegenTemplates];
            this.ultimates = [...window.game.ultimateTemplates];
        }
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('inventory-search');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderAllTabs();
        });
    }

    setupLayoutControls() {
        const gridBtn = document.getElementById('grid-layout');
        const listBtn = document.getElementById('list-layout');
        
        gridBtn.addEventListener('click', () => {
            this.currentLayout = 'grid';
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            this.renderAllTabs();
        });
        
        listBtn.addEventListener('click', () => {
            this.currentLayout = 'list';
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            this.renderAllTabs();
        });
    }

    switchTab(tabName) {
        // 更新活动标签按钮
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新活动内容面板
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    renderAllTabs() {
        this.renderCharacters();
        this.renderSkills();
        this.renderPassives();
        this.renderManaRegen();
        this.renderUltimates();
    }

    filterItems(items, searchFields) {
        if (!this.searchTerm) return items;
        
        return items.filter(item => {
            return searchFields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(this.searchTerm);
            });
        });
    }

    renderCharacters() {
        const container = document.getElementById('inventory-characters');
        container.innerHTML = '';

        let filteredCharacters = this.filterItems(this.characters, ['name', 'description']);
        
        if (filteredCharacters.length === 0) {
            container.innerHTML = '<p>暂无角色</p>';
            return;
        }

        // 根据布局设置容器类名
        container.className = this.currentLayout === 'list' ? 'character-list' : 'character-grid';

        filteredCharacters.forEach(character => {
            if (this.currentLayout === 'list') {
                // 列表布局
                const characterItem = document.createElement('div');
                characterItem.className = 'character-list-item';
                characterItem.innerHTML = `
                    <div class="character-list-header">
                        <div class="character-image" style="color: ${window.game.getTypeColor(character.type)}">
                            <span>${character.image || character.name.charAt(0)}</span>
                        </div>
                        <div class="character-info">
                            <div class="character-name">${character.name}</div>
                            <div class="character-type">${window.game.formatType(character.type)}</div>
                        </div>
                        <div class="character-stats">
                            <div class="stat">
                                <div>生命</div>
                                <div class="stat-value">${character.maxHealth}</div>
                            </div>
                            <div class="stat">
                                <div>攻击</div>
                                <div class="stat-value">${character.attack}</div>
                            </div>
                        </div>
                    </div>
                    <div class="character-description short-desc">
                        <p>${character.description || '暂无描述'}</p>
                    </div>
                `;
                container.appendChild(characterItem);
            } else {
                // 网格布局
                const characterCard = document.createElement('div');
                characterCard.className = 'character-card';
                characterCard.innerHTML = `
                    <div class="character-image" style="color: ${window.game.getTypeColor(character.type)}">
                        <span>${character.image || character.name.charAt(0)}</span>
                    </div>
                    <div class="character-name">${character.name}</div>
                    <div class="character-type">${window.game.formatType(character.type)}</div>
                    <div class="character-stats">
                        <div class="stat">
                            <div>生命</div>
                            <div class="stat-value">${character.maxHealth}</div>
                        </div>
                        <div class="stat">
                            <div>攻击</div>
                            <div class="stat-value">${character.attack}</div>
                        </div>
                    </div>
                    <div class="character-description short-desc">
                        <p>${character.description || '暂无描述'}</p>
                    </div>
                `;
                container.appendChild(characterCard);
            }
        });
    }

    renderSkills() {
        const container = document.getElementById('inventory-skills');
        container.innerHTML = '';

        let filteredSkills = this.filterItems(this.skills, ['name', 'description']);
        
        if (filteredSkills.length === 0) {
            container.innerHTML = '<p>暂无技能</p>';
            return;
        }

        // 根据布局设置容器类名
        container.className = this.currentLayout === 'list' ? 'items-list' : 'items-grid';

        filteredSkills.forEach(skill => {
            if (this.currentLayout === 'list') {
                // 列表布局
                const skillItem = document.createElement('div');
                skillItem.className = 'item-list-item';
                skillItem.innerHTML = `
                    <div class="item-header">
                        <div class="item-image" style="color: ${window.game.getTypeColor(skill.type)}">
                            <span>${skill.name.charAt(0)}</span>
                        </div>
                        <div class="item-info">
                            <div class="item-name">${skill.name}</div>
                            <div class="item-type" style="color: ${window.game.getTypeColor(skill.type)}">${window.game.formatType(skill.type)}</div>
                        </div>
                        <div class="item-stats">
                            ${skill.power ? `<div class="stat">威力: ${skill.power}</div>` : ''}
                            ${skill.manaCost ? `<div class="stat">消耗: ${skill.manaCost}</div>` : ''}
                        </div>
                    </div>
                    <div class="item-description">
                        <p>${skill.description}</p>
                    </div>
                `;
                container.appendChild(skillItem);
            } else {
                // 网格布局
                const skillCard = document.createElement('div');
                skillCard.className = 'item-card';
                skillCard.innerHTML = `
                    <div class="item-header">
                        <div class="item-image" style="color: ${window.game.getTypeColor(skill.type)}">
                            <span>${skill.name.charAt(0)}</span>
                        </div>
                        <div class="item-info">
                            <div class="item-name">${skill.name}</div>
                            <div class="item-type" style="color: ${window.game.getTypeColor(skill.type)}">${window.game.formatType(skill.type)}</div>
                        </div>
                    </div>
                    <div class="item-description">
                        <p>${skill.description}</p>
                    </div>
                    <div class="item-stats">
                        ${skill.power ? `<div class="stat">威力: ${skill.power}</div>` : ''}
                        ${skill.manaCost ? `<div class="stat">消耗: ${skill.manaCost}</div>` : ''}
                        ${skill.heal ? `<div class="stat">治疗: ${skill.heal}</div>` : ''}
                    </div>
                `;
                container.appendChild(skillCard);
            }
        });
    }

    renderPassives() {
        const container = document.getElementById('inventory-passives');
        container.innerHTML = '';

        let filteredPassives = this.filterItems(this.passives, ['name', 'description']);
        
        if (filteredPassives.length === 0) {
            container.innerHTML = '<p>暂无被动技能</p>';
            return;
        }

        // 根据布局设置容器类名
        container.className = this.currentLayout === 'list' ? 'items-list' : 'items-grid';

        filteredPassives.forEach(passive => {
            if (this.currentLayout === 'list') {
                // 列表布局
                const passiveItem = document.createElement('div');
                passiveItem.className = 'item-list-item';
                passiveItem.innerHTML = `
                    <div class="item-header">
                        <div class="item-image" style="color: ${window.game.getTypeColor(passive.type)}">
                            <span>${passive.name.charAt(0)}</span>
                        </div>
                        <div class="item-info">
                            <div class="item-name">${passive.name}</div>
                            <div class="item-type" style="color: ${window.game.getTypeColor(passive.type)}">${window.game.formatType(passive.type)}</div>
                        </div>
                    </div>
                    <div class="item-description">
                        <p>${passive.description}</p>
                    </div>
                `;
                container.appendChild(passiveItem);
            } else {
                // 网格布局
                const passiveCard = document.createElement('div');
                passiveCard.className = 'item-card';
                passiveCard.innerHTML = `
                    <div class="item-header">
                        <div class="item-image" style="color: ${window.game.getTypeColor(passive.type)}">
                            <span>${passive.name.charAt(0)}</span>
                        </div>
                        <div class="item-info">
                            <div class="item-name">${passive.name}</div>
                            <div class="item-type" style="color: ${window.game.getTypeColor(passive.type)}">${window.game.formatType(passive.type)}</div>
                        </div>
                    </div>
                    <div class="item-description">
                        <p>${passive.description}</p>
                    </div>
                `;
                container.appendChild(passiveCard);
            }
        });
    }

    renderManaRegen() {
        const container = document.getElementById('inventory-manaregen');
        container.innerHTML = '';

        let filteredManaRegen = this.filterItems(this.manaRegen, ['name', 'description']);
        
        if (filteredManaRegen.length === 0) {
            container.innerHTML = '<p>暂无回蓝机制</p>';
            return;
        }

        // 根据布局设置容器类名
        container.className = this.currentLayout === 'list' ? 'items-list' : 'items-grid';

        filteredManaRegen.forEach(manaRegen => {
            if (this.currentLayout === 'list') {
                // 列表布局
                const manaRegenItem = document.createElement('div');
                manaRegenItem.className = 'item-list-item';
                manaRegenItem.innerHTML = `
                    <div class="item-header">
                        <div class="item-image" style="color: ${window.game.getTypeColor(manaRegen.type)}">
                            <span>${manaRegen.name.charAt(0)}</span>
                        </div>
                        <div class="item-info">
                            <div class="item-name">${manaRegen.name}</div>
                            <div class="item-type" style="color: ${window.game.getTypeColor(manaRegen.type)}">${window.game.formatType(manaRegen.type)}</div>
                        </div>
                        <div class="item-stats">
                            <div class="stat">每回合回复: ${manaRegen.rate}</div>
                        </div>
                    </div>
                    <div class="item-description">
                        <p>${manaRegen.description}</p>
                    </div>
                `;
                container.appendChild(manaRegenItem);
            } else {
                // 网格布局
                const manaRegenCard = document.createElement('div');
                manaRegenCard.className = 'item-card';
                manaRegenCard.innerHTML = `
                    <div class="item-header">
                        <div class="item-image" style="color: ${window.game.getTypeColor(manaRegen.type)}">
                            <span>${manaRegen.name.charAt(0)}</span>
                        </div>
                        <div class="item-info">
                            <div class="item-name">${manaRegen.name}</div>
                            <div class="item-type" style="color: ${window.game.getTypeColor(manaRegen.type)}">${window.game.formatType(manaRegen.type)}</div>
                        </div>
                    </div>
                    <div class="item-description">
                        <p>${manaRegen.description}</p>
                    </div>
                    <div class="item-stats">
                        <div class="stat">每回合回复: ${manaRegen.rate}</div>
                    </div>
                `;
                container.appendChild(manaRegenCard);
            }
        });
    }

    renderUltimates() {
        const container = document.getElementById('inventory-ultimates');
        container.innerHTML = '';

        let filteredUltimates = this.filterItems(this.ultimates, ['name', 'description']);
        
        if (filteredUltimates.length === 0) {
            container.innerHTML = '<p>暂无大招</p>';
            return;
        }

        // 根据布局设置容器类名
        container.className = this.currentLayout === 'list' ? 'items-list' : 'items-grid';

        filteredUltimates.forEach(ultimate => {
            if (this.currentLayout === 'list') {
                // 列表布局
                const ultimateItem = document.createElement('div');
                ultimateItem.className = 'item-list-item';
                ultimateItem.innerHTML = `
                    <div class="item-header">
                        <div class="item-image" style="color: ${window.game.getTypeColor(ultimate.type)}">
                            <span>${ultimate.name.charAt(0)}</span>
                        </div>
                        <div class="item-info">
                            <div class="item-name">${ultimate.name}</div>
                            <div class="item-type" style="color: ${window.game.getTypeColor(ultimate.type)}">${window.game.formatType(ultimate.type)}</div>
                        </div>
                        <div class="item-stats">
                            ${ultimate.power ? `<div class="stat">威力: ${ultimate.power}</div>` : ''}
                            ${ultimate.rageCost ? `<div class="stat">消耗: ${ultimate.rageCost}</div>` : ''}
                        </div>
                    </div>
                    <div class="item-description">
                        <p>${ultimate.description}</p>
                    </div>
                `;
                container.appendChild(ultimateItem);
            } else {
                // 网格布局
                const ultimateCard = document.createElement('div');
                ultimateCard.className = 'item-card';
                ultimateCard.innerHTML = `
                    <div class="item-header">
                        <div class="item-image" style="color: ${window.game.getTypeColor(ultimate.type)}">
                            <span>${ultimate.name.charAt(0)}</span>
                        </div>
                        <div class="item-info">
                            <div class="item-name">${ultimate.name}</div>
                            <div class="item-type" style="color: ${window.game.getTypeColor(ultimate.type)}">${window.game.formatType(ultimate.type)}</div>
                        </div>
                    </div>
                    <div class="item-description">
                        <p>${ultimate.description}</p>
                    </div>
                    <div class="item-stats">
                        ${ultimate.power ? `<div class="stat">威力: ${ultimate.power}</div>` : ''}
                        ${ultimate.rageCost ? `<div class="stat">消耗: ${ultimate.rageCost}</div>` : ''}
                        ${ultimate.heal ? `<div class="stat">治疗: ${ultimate.heal}</div>` : ''}
                    </div>
                `;
                container.appendChild(ultimateCard);
            }
        });
    }
}

// 页面加载完成后初始化背包
document.addEventListener('DOMContentLoaded', function() {
    window.inventory = new Inventory();
});