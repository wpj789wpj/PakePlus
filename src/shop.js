// 玩家社区逻辑

class CommunityShop {
    constructor() {
        this.communityItems = {
            characters: [],
            skills: [],
            passives: [],
            manaregen: [],
            ultimates: []
        };
        this.init();
    }

    init() {
        this.loadCommunityItems();
        this.setupTabNavigation();
        this.setupEventListeners();
        this.renderAllTabs();
    }

    loadCommunityItems() {
        try {
            // 从localStorage加载社区物品
            const savedItems = localStorage.getItem('communityItems');
            if (savedItems) {
                this.communityItems = JSON.parse(savedItems);
            } else {
                // 初始化一些示例物品
                this.initializeSampleItems();
            }
        } catch (e) {
            console.error('加载社区物品失败:', e);
            this.initializeSampleItems();
        }
    }

    initializeSampleItems() {
        // 添加一些示例角色
        this.communityItems.characters = [
            {
                id: 1,
                name: "风暴法师",
                type: "water",
                description: "掌控雷电与风暴的法师职业，拥有强大的范围攻击能力。",
                content: {
                    "name": "风暴法师",
                    "type": "water",
                    "maxHealth": 90,
                    "health": 90,
                    "maxMana": 140,
                    "mana": 140,
                    "maxRage": 100,
                    "rage": 0,
                    "attack": 25,
                    "defense": 12,
                    "skills": [11, 2],
                    "passives": [7],
                    "manaRegen": 6,
                    "ultimates": [7],
                    "description": "掌控雷电与风暴的法师职业，拥有强大的范围攻击能力。"
                }
            }
        ];

        // 添加一些示例技能
        this.communityItems.skills = [
            {
                id: 1,
                name: "冰霜之环",
                type: "water",
                description: "释放冰霜之力，对周围敌人造成伤害并减速。",
                content: {
                    "id": 17,
                    "name": "冰霜之环",
                    "type": "water",
                    "power": 50,
                    "manaCost": 30,
                    "description": "释放冰霜之力，对周围敌人造成伤害并减速。"
                }
            }
        ];

        // 添加一些示例被动技能
        this.communityItems.passives = [
            {
                id: 1,
                name: "寒冰护体",
                type: "water",
                description: "受到攻击时有15%概率冻结攻击者。",
                content: {
                    "id": 11,
                    "name": "寒冰护体",
                    "type": "water",
                    "description": "受到攻击时有15%概率冻结攻击者。"
                }
            }
        ];

        // 添加一些示例回蓝机制
        this.communityItems.manaregen = [
            {
                id: 1,
                name: "冰霜之心",
                type: "water",
                description: "每回合回复7点魔法值，受到伤害时有10%概率回复额外魔法值。",
                content: {
                    "id": 8,
                    "name": "冰霜之心",
                    "type": "water",
                    "rate": 7,
                    "description": "每回合回复7点魔法值，受到伤害时有10%概率回复额外魔法值。"
                }
            }
        ];

        // 添加一些示例大招
        this.communityItems.ultimates = [
            {
                id: 1,
                name: "冰封千里",
                type: "water",
                description: "释放极寒之力，冻结所有敌人并造成巨额伤害。",
                content: {
                    "id": 11,
                    "name": "冰封千里",
                    "type": "water",
                    "power": 120,
                    "rageCost": 100,
                    "description": "释放极寒之力，冻结所有敌人并造成巨额伤害。"
                }
            }
        ];

        this.saveCommunityItems();
    }

    saveCommunityItems() {
        try {
            localStorage.setItem('communityItems', JSON.stringify(this.communityItems));
        } catch (e) {
            console.error('保存社区物品失败:', e);
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

    setupEventListeners() {
        // 发布按钮
        document.getElementById('publish-btn').addEventListener('click', () => {
            this.openPublishModal();
        });

        // 发布表单提交
        document.getElementById('publish-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.publishItem();
        });

        // 取消发布
        document.querySelectorAll('.cancel-publish').forEach(button => {
            button.addEventListener('click', () => {
                this.closePublishModal();
            });
        });

        // 关闭模态框
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closePublishModal();
        });

        // 搜索功能
        document.getElementById('search-input').addEventListener('input', () => {
            this.filterItems();
        });

        document.getElementById('category-filter').addEventListener('change', () => {
            this.filterItems();
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

    openPublishModal() {
        document.getElementById('publish-modal').style.display = 'block';
    }

    closePublishModal() {
        document.getElementById('publish-modal').style.display = 'none';
        document.getElementById('publish-form').reset();
    }

    publishItem() {
        const category = document.getElementById('publish-category').value;
        const name = document.getElementById('publish-name').value;
        const description = document.getElementById('publish-description').value;
        const contentText = document.getElementById('publish-content').value;

        if (!category || !name || !description || !contentText) {
            alert('请填写所有必填字段');
            return;
        }

        try {
            const content = JSON.parse(contentText);
            
            // 创建新物品
            const newItem = {
                id: Date.now(), // 使用时间戳作为ID
                name,
                type: content.type || 'fire',
                description,
                content
            };

            // 添加到对应类别
            this.communityItems[category].push(newItem);
            this.saveCommunityItems();
            this.renderTab(category);
            this.closePublishModal();
            alert('内容发布成功！');
        } catch (e) {
            alert('JSON格式错误: ' + e.message);
        }
    }

    filterItems() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        
        // 如果选择了特定类别，只在该类别中搜索
        if (categoryFilter !== 'all') {
            this.renderTab(categoryFilter, searchTerm);
        } else {
            // 在所有类别中搜索
            Object.keys(this.communityItems).forEach(category => {
                this.renderTab(category, searchTerm);
            });
        }
    }

    renderAllTabs() {
        Object.keys(this.communityItems).forEach(category => {
            this.renderTab(category);
        });
    }

    renderTab(category, searchTerm = '') {
        const container = document.getElementById(`community-${category}`);
        container.innerHTML = '';

        let items = this.communityItems[category];
        
        // 应用搜索过滤
        if (searchTerm) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchTerm) || 
                item.description.toLowerCase().includes(searchTerm)
            );
        }

        if (items.length === 0) {
            container.innerHTML = '<p>暂无内容</p>';
            return;
        }

        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'community-item-card';
            itemCard.innerHTML = `
                <div class="item-header">
                    <div class="item-image" style="color: ${window.game.getTypeColor(item.type)}">
                        <span>${item.name.charAt(0)}</span>
                    </div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-type" style="color: ${window.game.getTypeColor(item.type)}">${window.game.formatType(item.type)}</div>
                    </div>
                </div>
                <div class="item-description">
                    <p>${item.description}</p>
                </div>
                <div class="item-actions">
                    <button class="btn secondary download-btn" data-category="${category}" data-id="${item.id}">下载</button>
                </div>
            `;

            // 添加下载按钮事件
            const downloadBtn = itemCard.querySelector('.download-btn');
            downloadBtn.addEventListener('click', (e) => {
                const categoryId = e.target.dataset.category;
                const itemId = parseInt(e.target.dataset.id);
                this.downloadItem(categoryId, itemId);
            });

            container.appendChild(itemCard);
        });
    }

    downloadItem(category, itemId) {
        const item = this.communityItems[category].find(i => i.id === itemId);
        if (!item) {
            alert('未找到该物品');
            return;
        }

        try {
            // 根据类别处理下载
            switch (category) {
                case 'characters':
                    this.downloadCharacter(item);
                    break;
                case 'skills':
                    this.downloadSkill(item);
                    break;
                case 'passives':
                    this.downloadPassive(item);
                    break;
                case 'manaregen':
                    this.downloadManaRegen(item);
                    break;
                case 'ultimates':
                    this.downloadUltimate(item);
                    break;
                default:
                    alert('未知类别');
                    return;
            }
            
            alert(`${item.name} 下载成功！`);
        } catch (e) {
            alert('下载失败: ' + e.message);
        }
    }

    downloadCharacter(item) {
        try {
            // 将角色添加到玩家的自定义角色中
            let customCharacters = [];
            const savedCharacters = localStorage.getItem('customCharacters');
            if (savedCharacters) {
                customCharacters = JSON.parse(savedCharacters);
            }

            // 检查是否已存在
            const existingIndex = customCharacters.findIndex(c => c.name === item.content.name);
            if (existingIndex !== -1) {
                if (confirm(`角色 ${item.name} 已存在，是否覆盖？`)) {
                    customCharacters[existingIndex] = item.content;
                } else {
                    return;
                }
            } else {
                customCharacters.push(item.content);
            }

            localStorage.setItem('customCharacters', JSON.stringify(customCharacters));
            alert('角色已添加到你的角色列表中！');
        } catch (e) {
            throw new Error('无法保存角色: ' + e.message);
        }
    }

    downloadSkill(item) {
        try {
            // 技能需要通过角色编辑器使用，这里只是提示用户
            const skillJson = JSON.stringify(item.content, null, 2);
            alert(`技能信息已复制到剪贴板（在实际应用中）\n\n${skillJson}`);
        } catch (e) {
            throw new Error('无法处理技能: ' + e.message);
        }
    }

    downloadPassive(item) {
        try {
            // 被动技能需要通过角色编辑器使用，这里只是提示用户
            const passiveJson = JSON.stringify(item.content, null, 2);
            alert(`被动技能信息已复制到剪贴板（在实际应用中）\n\n${passiveJson}`);
        } catch (e) {
            throw new Error('无法处理被动技能: ' + e.message);
        }
    }

    downloadManaRegen(item) {
        try {
            // 回蓝机制需要通过角色编辑器使用，这里只是提示用户
            const manaRegenJson = JSON.stringify(item.content, null, 2);
            alert(`回蓝机制信息已复制到剪贴板（在实际应用中）\n\n${manaRegenJson}`);
        } catch (e) {
            throw new Error('无法处理回蓝机制: ' + e.message);
        }
    }

    downloadUltimate(item) {
        try {
            // 大招需要通过角色编辑器使用，这里只是提示用户
            const ultimateJson = JSON.stringify(item.content, null, 2);
            alert(`大招信息已复制到剪贴板（在实际应用中）\n\n${ultimateJson}`);
        } catch (e) {
            throw new Error('无法处理大招: ' + e.message);
        }
    }
}

// 页面加载完成后初始化社区商店
document.addEventListener('DOMContentLoaded', function() {
    window.communityShop = new CommunityShop();
});