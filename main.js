// Qxel Main JavaScript - Complete Application Logic

// API Configuration
const API_BASE_URL = '/shx/has/izu/end/output';
const PROJECTS_PER_PAGE = 20;

// State Management
let appState = {
    currentPage: 1,
    totalProjects: 0,
    totalPages: 1,
    searchQuery: '',
    activeFilters: {
        categories: [],
        uploadedDate: ''
    },
    availableCategories: []
};

// DOM Elements
const elements = {
    // Navigation
    hamburgerBtn: document.getElementById('hamburgerBtn'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    
    // Search
    searchForm: document.getElementById('searchForm'),
    searchInput: document.getElementById('searchInput'),
    filterBtn: document.getElementById('filterBtn'),
    filterPanel: document.getElementById('filterPanel'),
    closeFilterBtn: document.getElementById('closeFilterBtn'),
    applyFiltersBtn: document.getElementById('applyFiltersBtn'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),
    
    // Results
    resultsGrid: document.getElementById('resultsGrid'),
    resultsCount: document.getElementById('resultsCount'),
    paginationContainer: document.getElementById('paginationContainer'),
    
    // Footer
    currentYear: document.getElementById('currentYear'),
    
    // Filter elements
    categoryTags: document.querySelector('.category-tags'),
    dateOptions: document.querySelectorAll('input[name="uploadDate"]')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Core Initialization
async function initializeApp() {
    try {
        // Set current year in footer
        if (elements.currentYear) {
            elements.currentYear.textContent = new Date().getFullYear();
        }
        
        // Initialize event listeners
        setupEventListeners();
        
        // Load initial projects
        await loadProjects();
        
        // Load available categories for filtering
        await loadCategories();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
    if (elements.hamburgerBtn) {
        elements.hamburgerBtn.addEventListener('click', toggleDropdownMenu);
        document.addEventListener('click', (e) => {
            if (!elements.hamburgerBtn.contains(e.target) && 
                !elements.dropdownMenu.contains(e.target)) {
                closeDropdownMenu();
            }
        });
    }
    
    // Search
    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', handleSearch);
    }
    
    // Filter Panel
    if (elements.filterBtn) {
        elements.filterBtn.addEventListener('click', toggleFilterPanel);
    }
    
    if (elements.closeFilterBtn) {
        elements.closeFilterBtn.addEventListener('click', closeFilterPanel);
    }
    
    if (elements.applyFiltersBtn) {
        elements.applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (elements.clearFiltersBtn) {
        elements.clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Close filter panel when clicking outside
    document.addEventListener('click', (e) => {
        if (elements.filterPanel && 
            !elements.filterPanel.contains(e.target) && 
            !elements.filterBtn.contains(e.target) &&
            elements.filterPanel.classList.contains('active')) {
            closeFilterPanel();
        }
    });
    
    // Pagination event delegation
    if (elements.paginationContainer) {
        elements.paginationContainer.addEventListener('click', handlePaginationClick);
    }
}

// Navigation Functions
function toggleDropdownMenu() {
    const isExpanded = elements.hamburgerBtn.getAttribute('aria-expanded') === 'true';
    elements.hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
    elements.dropdownMenu.classList.toggle('active');
}

function closeDropdownMenu() {
    elements.hamburgerBtn.setAttribute('aria-expanded', 'false');
    elements.dropdownMenu.classList.remove('active');
}

// Search Functions
async function handleSearch(e) {
    e.preventDefault();
    
    const query = elements.searchInput.value.trim();
    appState.searchQuery = query;
    appState.currentPage = 1;
    
    if (query) {
        await performSearch(query);
    } else {
        await loadProjects();
    }
    
    closeFilterPanel();
}

async function performSearch(query) {
    try {
        showLoading();
        
        const params = new URLSearchParams({
            q: query,
            page: appState.currentPage
        });
        
        // Add active filters
        if (appState.activeFilters.categories.length > 0) {
            appState.activeFilters.categories.forEach(cat => {
                params.append('categories', cat);
            });
        }
        
        if (appState.activeFilters.uploadedDate) {
            params.append('uploaded_date', appState.activeFilters.uploadedDate);
        }
        
        const response = await fetch(`${API_BASE_URL}/search?${params}`);
        
        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }
        
        const data = await response.json();
        displaySearchResults(data);
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to perform search. Please try again.');
    }
}

// Filter Functions
function toggleFilterPanel() {
    elements.filterPanel.classList.toggle('active');
    elements.filterBtn.setAttribute('aria-expanded', 
        elements.filterPanel.classList.contains('active'));
}

function closeFilterPanel() {
    elements.filterPanel.classList.remove('active');
    elements.filterBtn.setAttribute('aria-expanded', 'false');
}

async function loadCategories() {
    try {
        // This would normally come from an API endpoint
        // For now, we'll extract from existing projects or use default categories
        const defaultCategories = [
            'Technology', 'Healthcare', 'Finance', 'Education',
            'Retail', 'Manufacturing', 'Energy', 'Transportation',
            'Real Estate', 'Entertainment', 'Agriculture', 'Automotive'
        ];
        
        appState.availableCategories = defaultCategories;
        renderCategoryFilters();
        
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function renderCategoryFilters() {
    if (!elements.categoryTags) return;
    
    elements.categoryTags.innerHTML = '';
    
    appState.availableCategories.forEach(category => {
        const isActive = appState.activeFilters.categories.includes(category);
        const tag = document.createElement('div');
        tag.className = `category-tag ${isActive ? 'active' : ''}`;
        tag.textContent = category;
        tag.dataset.category = category;
        
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
        
        elements.categoryTags.appendChild(tag);
    });
}

function applyFilters() {
    // Get selected categories
    const selectedCategories = Array.from(
        elements.categoryTags.querySelectorAll('.category-tag.active')
    ).map(tag => tag.dataset.category);
    
    // Get selected date
    const selectedDate = document.querySelector('input[name="uploadDate"]:checked').value;
    
    // Update state
    appState.activeFilters.categories = selectedCategories;
    appState.activeFilters.uploadedDate = selectedDate;
    appState.currentPage = 1;
    
    // Execute search or load projects based on query
    if (appState.searchQuery) {
        performSearch(appState.searchQuery);
    } else {
        loadProjects();
    }
    
    closeFilterPanel();
}

function clearFilters() {
    // Clear category selections
    elements.categoryTags.querySelectorAll('.category-tag.active').forEach(tag => {
        tag.classList.remove('active');
    });
    
    // Reset date filter to default
    document.querySelector('input[name="uploadDate"][value=""]').checked = true;
    
    // Clear filter state
    appState.activeFilters.categories = [];
    appState.activeFilters.uploadedDate = '';
    appState.currentPage = 1;
    
    // Reload projects
    if (appState.searchQuery) {
        performSearch(appState.searchQuery);
    } else {
        loadProjects();
    }
    
    closeFilterPanel();
}

// Project Loading Functions
async function loadProjects() {
    try {
        showLoading();
        
        const params = new URLSearchParams({
            page: appState.currentPage
        });
        
        const response = await fetch(`${API_BASE_URL}/home?${params}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.status}`);
        }
        
        const data = await response.json();
        displayProjects(data);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        showError('Failed to load research reports. Please try again.');
    }
}

function displayProjects(data) {
    if (!data.projects || !Array.isArray(data.projects)) {
        showError('No projects available');
        return;
    }
    
    // Update state
    appState.totalProjects = data.pagination?.total || 0;
    appState.totalPages = Math.ceil(appState.totalProjects / PROJECTS_PER_PAGE);
    
    // Update results count
    if (elements.resultsCount) {
        elements.resultsCount.textContent = data.pagination?.total.toLocaleString() || '0';
    }
    
    // Clear previous results
    if (elements.resultsGrid) {
        elements.resultsGrid.innerHTML = '';
        
        if (data.projects.length === 0) {
            showNoResults();
            return;
        }
        
        // Create project cards
        data.projects.forEach(project => {
            const card = createProjectCard(project);
            elements.resultsGrid.appendChild(card);
        });
    }
    
    // Update pagination
    updatePagination(data.pagination);
}

function displaySearchResults(data) {
    if (!data.reports || !Array.isArray(data.reports)) {
        showError('No results found');
        return;
    }
    
    // Update state
    appState.totalProjects = data.pagination?.total || 0;
    appState.totalPages = Math.ceil(appState.totalProjects / PROJECTS_PER_PAGE);
    
    // Update results count
    if (elements.resultsCount) {
        const queryText = appState.searchQuery ? ` for "${appState.searchQuery}"` : '';
        elements.resultsCount.textContent = `${data.pagination?.total.toLocaleString()}${queryText}`;
    }
    
    // Clear previous results
    if (elements.resultsGrid) {
        elements.resultsGrid.innerHTML = '';
        
        if (data.reports.length === 0) {
            showNoResults();
            return;
        }
        
        // Create report cards
        data.reports.forEach(report => {
            const card = createReportCard(report);
            elements.resultsGrid.appendChild(card);
        });
    }
    
    // Update pagination
    updatePagination(data.pagination);
}

// Card Creation Functions
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'report-card';
    
    // Image
    const imageSection = project.thumbnail_url 
        ? `<img src="${project.thumbnail_url}" alt="${project.topic}" class="report-image" loading="lazy">`
        : `<div class="report-image-placeholder">📊</div>`;
    
    // Format price
    const formattedPrice = formatPrice(project.price);
    
    card.innerHTML = `
        ${imageSection}
        <div class="report-content">
            <h3 class="report-title" title="${project.topic || 'Untitled'}">
                ${project.topic || 'Untitled Report'}
            </h3>
            <div class="report-meta">
                <div class="report-price">${formattedPrice}</div>
                <div class="report-purchases">
                    <span>📈</span>
                    <span>${project.purchase_count || 0} purchases</span>
                </div>
            </div>
        </div>
    `;
    
    // Add click handler (can be expanded for detail view)
    card.addEventListener('click', () => {
        // TODO: Navigate to project detail page
        console.log('View project:', project.id);
    });
    
    return card;
}

function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'report-card';
    
    // Image
    const imageSection = report.thumbnail_url 
        ? `<img src="${report.thumbnail_url}" alt="${report.name}" class="report-image" loading="lazy">`
        : `<div class="report-image-placeholder">📊</div>`;
    
    // Format price
    const formattedPrice = formatPrice(report.price);
    
    // Categories
    const categoriesHTML = report.categories && report.categories.length > 0
        ? `<div class="report-categories">
            ${report.categories.slice(0, 3).map(cat => 
                `<span class="report-category-tag">${cat}</span>`
            ).join('')}
        </div>`
        : '';
    
    card.innerHTML = `
        ${imageSection}
        <div class="report-content">
            <h3 class="report-title" title="${report.name || 'Untitled'}">
                ${report.name || 'Untitled Report'}
            </h3>
            ${categoriesHTML}
            <div class="report-meta">
                <div class="report-price">${formattedPrice}</div>
            </div>
        </div>
    `;
    
    // Add click handler
    card.addEventListener('click', () => {
        // TODO: Navigate to report detail page
        console.log('View report:', report.id);
    });
    
    return card;
}

// Pagination Functions
function updatePagination(paginationData) {
    if (!elements.paginationContainer || !paginationData) return;
    
    elements.paginationContainer.innerHTML = '';
    
    const { offset, limit, total, returned, has_more } = paginationData;
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    
    // Don't show pagination if only one page
    if (totalPages <= 1) return;
    
    // Previous button
    const prevButton = createPaginationButton('‹', 'Previous page', currentPage > 1);
    if (currentPage <= 1) prevButton.disabled = true;
    prevButton.addEventListener('click', () => changePage(currentPage - 1));
    elements.paginationContainer.appendChild(prevButton);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
        const firstButton = createPaginationButton('1', 'Page 1');
        firstButton.addEventListener('click', () => changePage(1));
        elements.paginationContainer.appendChild(firstButton);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            elements.paginationContainer.appendChild(ellipsis);
        }
    }
    
    // Page range
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPaginationButton(
            i.toString(),
            `Page ${i}`,
            i === currentPage
        );
        if (i === currentPage) pageButton.classList.add('active');
        pageButton.addEventListener('click', () => changePage(i));
        elements.paginationContainer.appendChild(pageButton);
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            elements.paginationContainer.appendChild(ellipsis);
        }
        
        const lastButton = createPaginationButton(
            totalPages.toString(),
            `Page ${totalPages}`
        );
        lastButton.addEventListener('click', () => changePage(totalPages));
        elements.paginationContainer.appendChild(lastButton);
    }
    
    // Next button
    const nextButton = createPaginationButton('›', 'Next page', currentPage < totalPages);
    if (currentPage >= totalPages) nextButton.disabled = true;
    nextButton.addEventListener('click', () => changePage(currentPage + 1));
    elements.paginationContainer.appendChild(nextButton);
    
    // Page info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    elements.paginationContainer.appendChild(pageInfo);
}

function createPaginationButton(text, title, isActive = false) {
    const button = document.createElement('button');
    button.className = 'pagination-btn';
    button.textContent = text;
    button.title = title;
    button.setAttribute('aria-label', title);
    
    if (isActive) {
        button.classList.add('active');
    }
    
    return button;
}

function handlePaginationClick(e) {
    if (e.target.classList.contains('pagination-btn') && !e.target.disabled) {
        const pageText = e.target.textContent;
        if (pageText === '‹') {
            changePage(appState.currentPage - 1);
        } else if (pageText === '›') {
            changePage(appState.currentPage + 1);
        } else if (!isNaN(pageText)) {
            changePage(parseInt(pageText));
        }
    }
}

async function changePage(page) {
    if (page < 1 || page > appState.totalPages || page === appState.currentPage) return;
    
    appState.currentPage = page;
    
    // Scroll to top of results
    window.scrollTo({
        top: elements.resultsGrid.offsetTop - 100,
        behavior: 'smooth'
    });
    
    if (appState.searchQuery) {
        await performSearch(appState.searchQuery);
    } else {
        await loadProjects();
    }
}

// Utility Functions
function formatPrice(price) {
    if (typeof price !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(price);
}

function showLoading() {
    if (!elements.resultsGrid) return;
    
    elements.resultsGrid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading research reports...</p>
        </div>
    `;
}

function showNoResults() {
    if (!elements.resultsGrid) return;
    
    elements.resultsGrid.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
    `;
}

function showError(message) {
    if (!elements.resultsGrid) return;
    
    elements.resultsGrid.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>${message}</p>
            <button class="retry-btn" onclick="location.reload()">Retry</button>
        </div>
    `;
}

// Add some CSS for error and no results states
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .no-results, .error-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--spacing-3xl);
        background-color: var(--primary-white);
        border-radius: var(--radius-lg);
        border: 1px solid var(--gray-light);
    }
    
    .no-results-icon, .error-icon {
        font-size: 3rem;
        margin-bottom: var(--spacing-lg);
    }
    
    .no-results h3, .error-state h3 {
        color: var(--primary-black);
        margin-bottom: var(--spacing-sm);
    }
    
    .no-results p, .error-state p {
        color: var(--gray-medium);
        margin-bottom: var(--spacing-lg);
    }
    
    .retry-btn {
        padding: var(--spacing-md) var(--spacing-xl);
        background-color: var(--primary-black);
        color: var(--primary-white);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: background-color var(--transition-fast);
    }
    
    .retry-btn:hover {
        background-color: var(--secondary-black);
    }
    
    .report-categories {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-md);
    }
    
    .report-category-tag {
        padding: var(--spacing-xs) var(--spacing-sm);
        background-color: var(--tertiary-white);
        border-radius: var(--radius-full);
        font-size: var(--font-size-xs);
        color: var(--gray-dark);
    }
    
    .pagination-ellipsis {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 40px;
        height: 40px;
        color: var(--gray-medium);
    }
`;

document.head.appendChild(additionalStyles);

// Export for potential module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        loadProjects,
        performSearch
    };
}
