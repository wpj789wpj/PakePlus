// 角色编辑器逻辑

class CharacterEditor {
    constructor() {
        this.characters = [];
        this.nextId = 1;
        this.init();
    }

    init() {
        this.loadCharactersFromStorage();
        this.populateSkills();
        this.populatePassives();
        this.populateManaRegen();
        this.populateUltimates();
        this.setupEventListeners();
        this.renderSavedCharacters();
        this.updatePreview();
        this.setupCollapsibleSections();
        this.setupSelectionPreviews();
        this.setupSearchFunctionality();
    }

    loadCharactersFromStorage() {
        try {
            const savedCharacters = localStorage.getItem('customCharacters');
            if (savedCharacters) {
                this.characters = JSON.parse(savedCharacters);
                // 更新nextId以避免ID冲突
                const maxId = this.characters.reduce((max, character) => 
                    character.id > max ? character.id : max, 0);
                this.nextId = maxId + 1;
            } else {
                // 如果没有自定义角色，则使用默认模板
                this.characters = [...window.game.characterTemplates];
                this.nextId = Math.max(...this.characters.map(c => c.id)) + 1;
            }
        } catch (e) {
            console.error('加载角色失败:', e);
            this.characters = [...window.game.characterTemplates];
            this.nextId = Math.max(...this.characters.map(c => c.id)) + 1;
        }
    }

    saveCharactersToStorage() {
        try {
            localStorage.setItem('customCharacters', JSON.stringify(this.characters));
        } catch (e) {
            console.error('保存角色失败:', e);
            alert('保存角色失败！');
        }
    }

    populateSkills(searchTerm = '') {
        const skillsSelect = document.getElementById('character-skills');
        skillsSelect.innerHTML = '';
        
        let filteredSkills = window.game.skillTemplates;
        if (searchTerm) {
            filteredSkills = filteredSkills.filter(skill => 
                skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                skill.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        filteredSkills.forEach(skill => {
            const option = document.createElement('option');
            option.value = skill.id;
            option.textContent = `${skill.name} (${window.game.formatType(skill.type)})`;
            skillsSelect.appendChild(option);
        });
    }

    populatePassives(searchTerm = '') {
        const passivesSelect = document.getElementById('character-passives');
        passivesSelect.innerHTML = '';
        
        let filteredPassives = window.game.passiveTemplates;
        if (searchTerm) {
            filteredPassives = filteredPassives.filter(passive => 
                passive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                passive.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        filteredPassives.forEach(passive => {
            const option = document.createElement('option');
            option.value = passive.id;
            option.textContent = `${passive.name} (${window.game.formatType(passive.type)})`;
            passivesSelect.appendChild(option);
        });
    }

    populateManaRegen(searchTerm = '') {
        const manaRegenSelect = document.getElementById('character-manaregen');
        // 保留"无"选项
        manaRegenSelect.innerHTML = '<option value="">无</option>';
        
        let filteredManaRegen = window.game.manaRegenTemplates;
        if (searchTerm) {
            filteredManaRegen = filteredManaRegen.filter(manaRegen => 
                manaRegen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                manaRegen.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        filteredManaRegen.forEach(manaRegen => {
            const option = document.createElement('option');
            option.value = manaRegen.id;
            option.textContent = `${manaRegen.name} (${window.game.formatType(manaRegen.type)})`;
            manaRegenSelect.appendChild(option);
        });
    }

    populateUltimates(searchTerm = '') {
        const ultimatesSelect = document.getElementById('character-ultimates');
        ultimatesSelect.innerHTML = '';
        
        let filteredUltimates = window.game.ultimateTemplates;
        if (searchTerm) {
            filteredUltimates = filteredUltimates.filter(ultimate => 
                ultimate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ultimate.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        filteredUltimates.forEach(ultimate => {
            const option = document.createElement('option');
            option.value = ultimate.id;
            option.textContent = `${ultimate.name} (${window.game.formatType(ultimate.type)})`;
            ultimatesSelect.appendChild(option);
        });
    }

    setupSearchFunctionality() {
        // 技能搜索
        document.getElementById('skills-search').addEventListener('input', (e) => {
            this.populateSkills(e.target.value);
        });

        // 被动技能搜索
        document.getElementById('passives-search').addEventListener('input', (e) => {
            this.populatePassives(e.target.value);
        });

        // 自动回蓝机制搜索
        document.getElementById('manaregen-search').addEventListener('input', (e) => {
            this.populateManaRegen(e.target.value);
        });

        // 大招搜索
        document.getElementById('ultimates-search').addEventListener('input', (e) => {
            this.populateUltimates(e.target.value);
        });
    }

    setupCollapsibleSections() {
        const headers = document.querySelectorAll('.collapsible-header');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('.expand-icon');
                
                content.classList.toggle('show');
                icon.classList.toggle('rotated');
            });
        });
    }

    setupSelectionPreviews() {
        // 技能选择预览
        const skillsSelect = document.getElementById('character-skills');
        skillsSelect.addEventListener('change', () => {
            this.updateSkillsPreview();
        });

        // 被动技能选择预览
        const passivesSelect = document.getElementById('character-passives');
        passivesSelect.addEventListener('change', () => {
            this.updatePassivesPreview();
        });

        // 自动回蓝机制选择预览
        const manaRegenSelect = document.getElementById('character-manaregen');
        manaRegenSelect.addEventListener('change', () => {
            this.updateManaRegenPreview();
        });

        // 大招选择预览
        const ultimatesSelect = document.getElementById('character-ultimates');
        ultimatesSelect.addEventListener('change', () => {
            this.updateUltimatesPreview();
        });
    }

    updateSkillsPreview() {
        const selectedSkills = this.getSelectedSkills();
        const previewContainer = document.getElementById('selected-skills-preview');
        previewContainer.innerHTML = '';

        if (selectedSkills.length === 0) {
            previewContainer.innerHTML = '<p>未选择技能</p>';
            return;
        }

        const skillsList = document.createElement('div');
        skillsList.className = 'skills-preview-list';

        selectedSkills.forEach(skillId => {
            const skill = window.game.skillTemplates.find(s => s.id === skillId);
            if (skill) {
                const skillElement = document.createElement('div');
                skillElement.className = 'skill-preview-item';
                skillElement.innerHTML = `
                    <div class="skill-preview-header">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-type" style="color: ${window.game.getTypeColor(skill.type)}">${window.game.formatType(skill.type)}</span>
                    </div>
                    <div class="skill-preview-details">
                        <p>${skill.description}</p>
                        ${skill.power ? `<p>威力: ${skill.power}</p>` : ''}
                        ${skill.manaCost ? `<p>消耗: ${skill.manaCost} 魔法值</p>` : ''}
                        ${skill.heal ? `<p>治疗: ${skill.heal} 生命值</p>` : ''}
                    </div>
                `;
                skillsList.appendChild(skillElement);
            }
        });

        previewContainer.appendChild(skillsList);
    }

    updatePassivesPreview() {
        const selectedPassives = this.getSelectedPassives();
        const previewContainer = document.getElementById('selected-passives-preview');
        previewContainer.innerHTML = '';

        if (selectedPassives.length === 0) {
            previewContainer.innerHTML = '<p>未选择被动技能</p>';
            return;
        }

        const passivesList = document.createElement('div');
        passivesList.className = 'passives-preview-list';

        selectedPassives.forEach(passiveId => {
            const passive = window.game.passiveTemplates.find(p => p.id === passiveId);
            if (passive) {
                const passiveElement = document.createElement('div');
                passiveElement.className = 'passive-preview-item';
                passiveElement.innerHTML = `
                    <div class="passive-preview-header">
                        <span class="passive-name">${passive.name}</span>
                        <span class="passive-type" style="color: ${window.game.getTypeColor(passive.type)}">${window.game.formatType(passive.type)}</span>
                    </div>
                    <div class="passive-preview-details">
                        <p>${passive.description}</p>
                    </div>
                `;
                passivesList.appendChild(passiveElement);
            }
        });

        previewContainer.appendChild(passivesList);
    }

    updateManaRegenPreview() {
        const selectedManaRegen = document.getElementById('character-manaregen').value;
        const previewContainer = document.getElementById('selected-manaregen-preview');
        previewContainer.innerHTML = '';

        if (!selectedManaRegen) {
            previewContainer.innerHTML = '<p>未选择自动回蓝机制</p>';
            return;
        }

        const manaRegenId = parseInt(selectedManaRegen);
        const manaRegen = window.game.manaRegenTemplates.find(m => m.id === manaRegenId);
        if (manaRegen) {
            const manaRegenElement = document.createElement('div');
            manaRegenElement.className = 'manaregen-preview-item';
            manaRegenElement.innerHTML = `
                <div class="manaregen-preview-header">
                    <span class="manaregen-name">${manaRegen.name}</span>
                    <span class="manaregen-type" style="color: ${window.game.getTypeColor(manaRegen.type)}">${window.game.formatType(manaRegen.type)}</span>
                </div>
                <div class="manaregen-preview-details">
                    <p>${manaRegen.description}</p>
                    <p>每回合回复: ${manaRegen.rate} 魔法值</p>
                </div>
            `;
            previewContainer.appendChild(manaRegenElement);
        }
    }

    updateUltimatesPreview() {
        const selectedUltimates = this.getSelectedUltimates();
        const previewContainer = document.getElementById('selected-ultimates-preview');
        previewContainer.innerHTML = '';

        if (selectedUltimates.length === 0) {
            previewContainer.innerHTML = '<p>未选择大招</p>';
            return;
        }

        const ultimatesList = document.createElement('div');
        ultimatesList.className = 'ultimates-preview-list';

        selectedUltimates.forEach(ultimateId => {
            const ultimate = window.game.ultimateTemplates.find(u => u.id === ultimateId);
            if (ultimate) {
                const ultimateElement = document.createElement('div');
                ultimateElement.className = 'ultimate-preview-item';
                ultimateElement.innerHTML = `
                    <div class="ultimate-preview-header">
                        <span class="ultimate-name">${ultimate.name}</span>
                        <span class="ultimate-type" style="color: ${window.game.getTypeColor(ultimate.type)}">${window.game.formatType(ultimate.type)}</span>
                    </div>
                    <div class="ultimate-preview-details">
                        <p>${ultimate.description}</p>
                        ${ultimate.power ? `<p>威力: ${ultimate.power}</p>` : ''}
                        ${ultimate.rageCost ? `<p>消耗: ${ultimate.rageCost} 怒气值</p>` : ''}
                        ${ultimate.heal ? `<p>治疗: ${ultimate.heal} 生命值</p>` : ''}
                    </div>
                `;
                ultimatesList.appendChild(ultimateElement);
            }
        });

        previewContainer.appendChild(ultimatesList);
    }

    setupEventListeners() {
        // 表单输入事件监听
        const formInputs = document.querySelectorAll('#character-form input, #character-form select, #character-form textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updatePreview();
            });
        });

        // 表单提交
        document.getElementById('character-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCharacter();
        });

        // 导入JSON
        document.getElementById('import-json-btn').addEventListener('click', () => {
            this.importFromJSON();
        });

        // 导出JSON
        document.getElementById('export-json-btn').addEventListener('click', () => {
            this.exportToJSON();
        });

        // 重置表单
        document.getElementById('reset-form-btn').addEventListener('click', () => {
            this.resetForm();
        });

        // 描述展开/收起
        document.getElementById('toggle-description').addEventListener('click', (e) => {
            this.toggleDescription(e.target);
        });

        document.getElementById('preview-toggle-description').addEventListener('click', (e) => {
            this.toggleDescription(e.target);
        });

        // 监听描述文本变化
        document.getElementById('character-description').addEventListener('input', () => {
            this.updateDescriptionPreview();
        });
    }

    updateDescriptionPreview() {
        const description = document.getElementById('character-description').value || '暂无描述';
        const descriptionText = document.getElementById('description-text');
        const toggleButton = document.getElementById('toggle-description');
        const previewDescriptionText = document.getElementById('preview-desc');
        const previewToggleButton = document.getElementById('preview-toggle-description');

        descriptionText.textContent = description;
        previewDescriptionText.textContent = description;

        // 检查是否需要展开按钮
        if (description.length > 100) {
            toggleButton.style.display = 'block';
            previewToggleButton.style.display = 'block';
            descriptionText.classList.add('short');
            previewDescriptionText.classList.add('short');
        } else {
            toggleButton.style.display = 'none';
            previewToggleButton.style.display = 'none';
            descriptionText.classList.remove('short');
            previewDescriptionText.classList.remove('short');
        }
    }

    toggleDescription(button) {
        const descriptionText = button.previousElementSibling || document.getElementById('description-text');
        descriptionText.classList.toggle('short');
        button.textContent = descriptionText.classList.contains('short') ? '展开' : '收起';
    }

    updatePreview() {
        const name = document.getElementById('character-name').value || '未命名角色';
        const type = document.getElementById('character-type').value;
        const health = document.getElementById('character-health').value || 100;
        const mana = document.getElementById('character-mana').value || 50;
        const rage = document.getElementById('character-rage').value || 100;
        const attack = document.getElementById('character-attack').value || 20;
        const defense = document.getElementById('character-defense').value || 15;
        const description = document.getElementById('character-description').value || '暂无描述';
        const image = document.getElementById('character-image').value || name.charAt(0);

        // 更新预览
        document.getElementById('preview-name').textContent = name;
        document.getElementById('preview-type').textContent = `属性: ${type ? window.game.formatType(type) : '未选择'}`;
        document.getElementById('preview-stats').textContent = `生命值: ${health} | 魔法值: ${mana} | 怒气值: ${rage}`;
        
        // 更新描述预览
        this.updateDescriptionPreview();

        const previewImage = document.getElementById('preview-image');
        if (type) {
            previewImage.innerHTML = `<span style="color: ${window.game.getTypeColor(type)}">${image}</span>`;
        } else {
            previewImage.innerHTML = `<span>${image}</span>`;
        }
        
        // 更新所有预览
        this.updateSkillsPreview();
        this.updatePassivesPreview();
        this.updateManaRegenPreview();
        this.updateUltimatesPreview();
    }

    getSelectedSkills() {
        const select = document.getElementById('character-skills');
        return Array.from(select.selectedOptions).map(option => parseInt(option.value));
    }

    getSelectedPassives() {
        const select = document.getElementById('character-passives');
        return Array.from(select.selectedOptions).map(option => parseInt(option.value));
    }

    getSelectedUltimates() {
        const select = document.getElementById('character-ultimates');
        return Array.from(select.selectedOptions).map(option => parseInt(option.value));
    }

    saveCharacter() {
        const name = document.getElementById('character-name').value;
        const type = document.getElementById('character-type').value;
        const health = parseInt(document.getElementById('character-health').value) || 100;
        const mana = parseInt(document.getElementById('character-mana').value) || 50;
        const rage = parseInt(document.getElementById('character-rage').value) || 100;
        const attack = parseInt(document.getElementById('character-attack').value) || 20;
        const defense = parseInt(document.getElementById('character-defense').value) || 15;
        const description = document.getElementById('character-description').value;
        const image = document.getElementById('character-image').value;
        const skills = this.getSelectedSkills();
        const passives = this.getSelectedPassives();
        const manaRegen = document.getElementById('character-manaregen').value ? parseInt(document.getElementById('character-manaregen').value) : null;
        const ultimates = this.getSelectedUltimates();

        if (!name || !type) {
            alert('请填写角色名称和属性');
            return;
        }

        const character = {
            id: this.nextId++,
            name,
            type,
            maxHealth: health,
            health,
            maxMana: mana,
            mana,
            maxRage: rage,
            rage: 0,
            attack,
            defense,
            skills,
            passives,
            manaRegen,
            ultimates,
            description,
            image
        };

        this.characters.push(character);
        this.saveCharactersToStorage();
        this.renderSavedCharacters();
        this.resetForm();
        alert('角色保存成功！');
    }

    importFromJSON() {
        const jsonText = document.getElementById('character-json').value;
        if (!jsonText) {
            alert('请先输入JSON数据');
            return;
        }

        try {
            const character = JSON.parse(jsonText);
            
            // 验证必要字段
            if (!character.name || !character.type) {
                alert('JSON数据缺少必要字段（name或type）');
                return;
            }
            
            // 填充表单
            document.getElementById('character-name').value = character.name || '';
            document.getElementById('character-type').value = character.type || '';
            document.getElementById('character-health').value = character.maxHealth || character.health || 100;
            document.getElementById('character-mana').value = character.maxMana || character.mana || 50;
            document.getElementById('character-rage').value = character.maxRage || 100;
            document.getElementById('character-attack').value = character.attack || 20;
            document.getElementById('character-defense').value = character.defense || 15;
            document.getElementById('character-description').value = character.description || '';
            document.getElementById('character-image').value = character.image || '';
            
            // 选择技能
            const skillsSelect = document.getElementById('character-skills');
            Array.from(skillsSelect.options).forEach(option => {
                option.selected = character.skills && character.skills.includes(parseInt(option.value));
            });
            
            // 选择被动技能
            const passivesSelect = document.getElementById('character-passives');
            Array.from(passivesSelect.options).forEach(option => {
                option.selected = character.passives && character.passives.includes(parseInt(option.value));
            });
            
            // 选择自动回蓝机制
            document.getElementById('character-manaregen').value = character.manaRegen || '';
            
            // 选择大招
            const ultimatesSelect = document.getElementById('character-ultimates');
            Array.from(ultimatesSelect.options).forEach(option => {
                option.selected = character.ultimates && character.ultimates.includes(parseInt(option.value));
            });
            
            this.updatePreview();
            alert('JSON导入成功！');
        } catch (e) {
            alert('JSON格式错误: ' + e.message);
        }
    }

    exportToJSON() {
        const name = document.getElementById('character-name').value;
        const type = document.getElementById('character-type').value;
        const health = parseInt(document.getElementById('character-health').value) || 100;
        const mana = parseInt(document.getElementById('character-mana').value) || 50;
        const rage = parseInt(document.getElementById('character-rage').value) || 100;
        const attack = parseInt(document.getElementById('character-attack').value) || 20;
        const defense = parseInt(document.getElementById('character-defense').value) || 15;
        const description = document.getElementById('character-description').value;
        const image = document.getElementById('character-image').value;
        const skills = this.getSelectedSkills();
        const passives = this.getSelectedPassives();
        const manaRegen = document.getElementById('character-manaregen').value ? parseInt(document.getElementById('character-manaregen').value) : null;
        const ultimates = this.getSelectedUltimates();

        if (!name || !type) {
            alert('请先填写角色名称和属性');
            return;
        }

        const character = {
            name,
            type,
            maxHealth: health,
            health,
            maxMana: mana,
            mana,
            maxRage: rage,
            rage: 0,
            attack,
            defense,
            skills,
            passives,
            manaRegen,
            ultimates,
            description,
            image
        };

        const jsonText = JSON.stringify(character, null, 2);
        document.getElementById('character-json').value = jsonText;
        alert('角色已导出为JSON格式！');
    }

    resetForm() {
        document.getElementById('character-form').reset();
        const skillsSelect = document.getElementById('character-skills');
        const passivesSelect = document.getElementById('character-passives');
        const ultimatesSelect = document.getElementById('character-ultimates');
        
        Array.from(skillsSelect.options).forEach(option => {
            option.selected = false;
        });
        
        Array.from(passivesSelect.options).forEach(option => {
            option.selected = false;
        });
        
        Array.from(ultimatesSelect.options).forEach(option => {
            option.selected = false;
        });
        
        // 清空搜索框
        document.getElementById('skills-search').value = '';
        document.getElementById('passives-search').value = '';
        document.getElementById('manaregen-search').value = '';
        document.getElementById('ultimates-search').value = '';
        
        // 重新填充选项
        this.populateSkills();
        this.populatePassives();
        this.populateManaRegen();
        this.populateUltimates();
        
        this.updatePreview();
    }

    renderSavedCharacters() {
        const container = document.getElementById('saved-characters');
        container.innerHTML = '';

        if (this.characters.length === 0) {
            container.innerHTML = '<p>暂无保存的角色</p>';
            return;
        }

        this.characters.forEach(character => {
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
                        <div class="stat-value">${character.health}</div>
                    </div>
                    <div class="stat">
                        <div>攻击</div>
                        <div class="stat-value">${character.attack}</div>
                    </div>
                </div>
                <div class="character-actions">
                    <button class="edit-btn" data-id="${character.id}">编辑</button>
                    <button class="delete-btn" data-id="${character.id}">删除</button>
                </div>
            `;

            // 添加编辑按钮事件
            const editBtn = characterCard.querySelector('.edit-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadCharacter(character);
            });

            // 添加删除按钮事件
            const deleteBtn = characterCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCharacter(character.id);
            });

            // 添加卡片点击事件（加载角色）
            characterCard.addEventListener('click', () => {
                this.loadCharacter(character);
            });

            container.appendChild(characterCard);
        });
    }

    loadCharacter(character) {
        document.getElementById('character-name').value = character.name;
        document.getElementById('character-type').value = character.type;
        document.getElementById('character-health').value = character.maxHealth;
        document.getElementById('character-mana').value = character.maxMana;
        document.getElementById('character-rage').value = character.maxRage;
        document.getElementById('character-attack').value = character.attack;
        document.getElementById('character-defense').value = character.defense;
        document.getElementById('character-description').value = character.description || '';
        document.getElementById('character-image').value = character.image || '';

        // 选择技能
        const skillsSelect = document.getElementById('character-skills');
        Array.from(skillsSelect.options).forEach(option => {
            option.selected = character.skills && character.skills.includes(parseInt(option.value));
        });

        // 选择被动技能
        const passivesSelect = document.getElementById('character-passives');
        Array.from(passivesSelect.options).forEach(option => {
            option.selected = character.passives && character.passives.includes(parseInt(option.value));
        });

        // 选择自动回蓝机制
        document.getElementById('character-manaregen').value = character.manaRegen || '';

        // 选择大招
        const ultimatesSelect = document.getElementById('character-ultimates');
        Array.from(ultimatesSelect.options).forEach(option => {
            option.selected = character.ultimates && character.ultimates.includes(parseInt(option.value));
        });

        this.updatePreview();
    }

    deleteCharacter(id) {
        if (confirm('确定要删除这个角色吗？')) {
            this.characters = this.characters.filter(character => character.id !== id);
            this.saveCharactersToStorage();
            this.renderSavedCharacters();
        }
    }
}

// 页面加载完成后初始化编辑器
document.addEventListener('DOMContentLoaded', function() {
    window.characterEditor = new CharacterEditor();
});