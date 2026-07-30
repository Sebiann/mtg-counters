(async function() {
    const ICON_BASE_PATH = './assets/icons/';
    const WIKI_SEARCH_BASE_URL = 'https://mtg.wiki/wiki/Special:Search?search=';
    const contentRoot = document.getElementById('content');
    const searchInput = document.getElementById('keyword-search');
    const noResults = document.getElementById('no-results');

    function resolveIconPath(iconPath) {
        if (!iconPath) {
            return '';
        }

        if (iconPath.startsWith('./') || iconPath.startsWith('/') || iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
            return iconPath;
        }

        return `${ICON_BASE_PATH}${iconPath}`;
    }

    function createIcon(iconPath, label) {
        const image = document.createElement('img');
        image.src = resolveIconPath(iconPath);
        image.alt = `${label} icon`;
        return image;
    }

    function setSearchText(element, parts) {
        element.dataset.search = parts.filter(Boolean).join(' ').toLowerCase();
    }

    function createTurnFlowSection(sectionData) {
        const section = document.createElement('section');
        section.className = 'category-section';

        const heading = document.createElement('h2');
        heading.textContent = sectionData.title;
        section.appendChild(heading);

        const list = document.createElement('ol');
        list.className = 'turn-flow';

        sectionData.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'turn-flow-item';

            const step = document.createElement('span');
            step.className = 'turn-step';
            step.textContent = item.step;

            const note = document.createElement('span');
            note.className = 'turn-step-note';
            note.textContent = item.note;

            listItem.append(step, note);
            setSearchText(listItem, [item.step, item.note]);
            list.appendChild(listItem);
        });

        section.appendChild(list);
        return section;
    }

    function createKeywordEntry(item) {
        const entry = document.createElement('div');
        entry.className = 'keyword-entry';

        const row = document.createElement('div');
        row.className = 'keyword-row';
        row.dataset.keyword = item.key;

        if (item.icon) {
            row.appendChild(createIcon(item.icon, item.label));
        }

        const label = document.createElement('span');
        const labelText = document.createElement('span');
        labelText.textContent = item.label;
        const indicator = document.createElement('span');
        indicator.className = 'expand-indicator';
        indicator.textContent = '▸';
        label.append(labelText, indicator);
        row.appendChild(label);

        const details = document.createElement('div');
        details.className = 'keyword-details';

        const title = document.createElement('h3');
        title.textContent = item.title;
        const description = document.createElement('p');
        description.textContent = item.description;
        const wikiLink = document.createElement('a');
        wikiLink.className = 'wiki-link';
        wikiLink.href = `${WIKI_SEARCH_BASE_URL}${encodeURIComponent(item.title || item.label)}`;
        wikiLink.target = '_blank';
        wikiLink.rel = 'noopener noreferrer';
        wikiLink.textContent = 'Read on MTG Wiki';

        details.append(title, description, wikiLink);

        if (item.bullets && item.bullets.length > 0) {
            const list = document.createElement('ul');
            item.bullets.forEach(bullet => {
                const listItem = document.createElement('li');
                listItem.textContent = bullet;
                list.appendChild(listItem);
            });
            details.appendChild(list);
        }

        row.addEventListener('click', () => {
            details.classList.toggle('open');
        });

        setSearchText(entry, [item.label, item.title, item.description, ...(item.bullets || [])]);
        entry.append(row, details);
        return entry;
    }

    function createKeywordSection(sectionData) {
        const section = document.createElement('section');
        section.className = 'category-section';

        const heading = document.createElement('h2');
        heading.textContent = sectionData.title;
        section.appendChild(heading);

        sectionData.items.forEach(item => {
            section.appendChild(createKeywordEntry(item));
        });

        return section;
    }

    function renderContent(data) {
        contentRoot.replaceChildren();

        data.sections.forEach(sectionData => {
            if (sectionData.type === 'turn-flow') {
                contentRoot.appendChild(createTurnFlowSection(sectionData));
                return;
            }

            contentRoot.appendChild(createKeywordSection(sectionData));
        });
    }

    function filterContent() {
        const query = searchInput.value.trim().toLowerCase();
        const filterableItems = Array.from(contentRoot.querySelectorAll('[data-search]'));
        let visibleCount = 0;

        filterableItems.forEach(item => {
            const matches = query === '' || item.dataset.search.includes(query);
            item.classList.toggle('filtered-out', !matches);

            if (!matches) {
                const openDetails = item.querySelector('.keyword-details.open');
                if (openDetails) {
                    openDetails.classList.remove('open');
                }
            }

            if (matches) {
                visibleCount += 1;
            }
        });

        Array.from(contentRoot.querySelectorAll('.category-section')).forEach(section => {
            const hasVisibleItems = section.querySelector('[data-search]:not(.filtered-out)');
            section.classList.toggle('filtered-out', !hasVisibleItems);
        });

        noResults.hidden = visibleCount > 0;
    }

    try {
        const response = await fetch('./data.json', { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`Failed to load data.json (${response.status})`);
        }

        const data = await response.json();
        renderContent(data);
        searchInput.addEventListener('input', filterContent);
        filterContent();
    } catch (error) {
        contentRoot.textContent = 'Unable to load the keyword data.';
        console.error(error);
    }
})();
