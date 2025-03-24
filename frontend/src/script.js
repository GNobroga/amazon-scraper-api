
function debounceTime(milleseconds, callback) {
   let timeoutId;
   return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), milleseconds);
   };
}

async function searchItems(keyword) {
    if (!keyword || !keyword.trim()) {
        throw new Error("Keyword is required to search items.");
    }

    const url = `http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.items || [];
    } catch (err) {
        console.error(`Failed to fetch items: ${err.message}`);
        return [];
    }
}

function displayItems(element, items) {
    if (!(element instanceof HTMLElement)) {
        throw new Error(`First parameter is not a valid HTML element, received ${elementType}`);
    }

    if (!Array.isArray(items)) {
        throw new Error('Second parameter is not a valid iterable');
    }

    if (items.length === 0) {
        element.innerHTML = `
             <tr>
                <td colspan="4" style="text-align: center; padding: 4rem 0; font-size: 1.2rem;">Sem conteúdo para exibir</td>
            </tr>
        `;
        return;
    }

    const htmlContent = Array.from(items).map(item => `
        <tr>
            <td>
                <img src="${item.imageUrl}" style="min-width: 100px; min-height: 100px;"/>
            </td>
            <td>${ item.recipeTitle }</td>
            <td>${ item.starRating }</td>
            <td>${ item.reviewCount }</td>
        </tr>
    `);

    element.innerHTML = htmlContent.join('');
}


const inputSearch = document.getElementById('search');
const tBody = document.querySelector('table > tbody');
const clearSearchButton = document.getElementById('clearSearchButton');

const disableClearSearchButton = () => clearSearchButton.style.display = 'none';

const enableClearSearchButton = () => clearSearchButton.style.display = 'block';

disableClearSearchButton();

const debounceTimeSearch = debounceTime(200, async event => {
    const { value } = event.target;
    const hasText = value?.trim() !== '';

    if (!hasText) {
        disableClearSearchButton();
    } else {
        enableClearSearchButton();
        const items = await searchItems(value);
        displayItems(tBody, items);
    }
})

inputSearch.oninput = debounceTimeSearch;

function clearSearch() {
    disableClearSearchButton();
    inputSearch.value = '';
    tBody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; padding: 4rem 0; font-size: 1.2rem;">Sem conteúdo para exibir</td>
        </tr>
    `;
}
