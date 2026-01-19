/**
 * ChromaVault - Professional Color Picker
 * No local storage - Export required to save
 */

// ============================================
// Color Utilities
// ============================================
const Color = {
    hsvToRgb(h, s, v) {
        h /= 360;
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },

    rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const d = max - min;
        let h, s = max === 0 ? 0 : d / max, v = max;

        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s, v };
    },

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    },

    hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    },

    hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const n = parseInt(hex, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    },

    rgbToLab(r, g, b) {
        let rL = r / 255, gL = g / 255, bL = b / 255;
        rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
        gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
        bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;

        let x = (rL * 0.4124 + gL * 0.3576 + bL * 0.1805) / 0.95047;
        let y = (rL * 0.2126 + gL * 0.7152 + bL * 0.0722);
        let z = (rL * 0.0193 + gL * 0.1192 + bL * 0.9505) / 1.08883;

        x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

        return { l: Math.round(116 * y - 16), a: Math.round(500 * (x - y)), b: Math.round(200 * (y - z)) };
    },

    labToLch(l, a, b) {
        const c = Math.sqrt(a * a + b * b);
        let h = Math.atan2(b, a) * 180 / Math.PI;
        if (h < 0) h += 360;
        return { l, c: Math.round(c), h: Math.round(h) };
    },

    getName(hex) {
        const names = {
            '#000000': 'Black', '#FFFFFF': 'White', '#FF0000': 'Red', '#00FF00': 'Lime',
            '#0000FF': 'Blue', '#FFFF00': 'Yellow', '#00FFFF': 'Cyan', '#FF00FF': 'Magenta',
            '#C0C0C0': 'Silver', '#808080': 'Gray', '#800000': 'Maroon', '#808000': 'Olive',
            '#008000': 'Green', '#800080': 'Purple', '#008080': 'Teal', '#000080': 'Navy',
            '#FFA500': 'Orange', '#FFC0CB': 'Pink', '#A52A2A': 'Brown', '#DC2626': 'Rose'
        };
        return names[hex.toUpperCase()] || 'Custom';
    },

    isValidHex(hex) {
        return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
    },

    normalize(hex) {
        if (!hex) return null;
        hex = hex.trim().toUpperCase();
        if (!hex.startsWith('#')) hex = '#' + hex;
        if (hex.length === 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        return this.isValidHex(hex) ? hex : null;
    },

    formats(r, g, b) {
        const hex = this.rgbToHex(r, g, b);
        const hsl = this.rgbToHsl(r, g, b);
        const lab = this.rgbToLab(r, g, b);
        const lch = this.labToLch(lab.l, lab.a, lab.b);

        return {
            name: this.getName(hex), 
            hex,
            rgb: `rgb(${r}, ${g}, ${b})`,
            hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
            lab: `lab(${lab.l}% ${lab.a} ${lab.b})`,
            lch: `lch(${lch.l}% ${lch.c} ${lch.h})`
        };
    }
};

// ============================================
// Toast
// ============================================
const toast = {
    el: document.getElementById('toast'),
    timeout: null,
    show(msg, duration = 2000) {
        this.el.textContent = msg;
        this.el.classList.add('show');
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.el.classList.remove('show'), duration);
    }
};

// ============================================
// Navigation
// ============================================
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(view + 'View').classList.add('active');
    });
});

// ============================================
// Settings Modal
// ============================================
const settingsModal = document.getElementById('settingsModal');

document.getElementById('settingsToggle').addEventListener('click', () => {
    settingsModal.classList.add('active');
});

document.getElementById('settingsToggleMobile').addEventListener('click', () => {
    settingsModal.classList.add('active');
});

document.getElementById('closeSettingsModal').addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

settingsModal.querySelector('.modal-backdrop').addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

// ============================================
// Color Picker
// ============================================
class Picker {
    constructor() {
        this.h = 0;
        this.s = 1;
        this.v = 1;
        this.format = 'hex';
        this.dragging = null;

        // Elements
        this.satArea = document.getElementById('saturationArea');
        this.satCanvas = document.getElementById('saturationCanvas');
        this.satCtx = this.satCanvas.getContext('2d');
        this.satCursor = document.getElementById('saturationCursor');
        
        this.hueArea = document.getElementById('hueArea');
        this.hueCursor = document.getElementById('hueCursor');
        
        this.preview = document.getElementById('previewColor');
        this.formatSelect = document.getElementById('formatSelect');
        this.valueInputs = document.getElementById('valueInputs');

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEvents();
        this.render();
        this.updateInputs();
    }

    setupCanvas() {
        const resize = () => {
            const rect = this.satArea.getBoundingClientRect();
            this.satCanvas.width = rect.width;
            this.satCanvas.height = rect.height;
            this.drawSaturation();
        };
        resize();
        window.addEventListener('resize', resize);
        new ResizeObserver(resize).observe(this.satArea);
    }

    drawSaturation() {
        const { width, height } = this.satCanvas;
        const ctx = this.satCtx;
        const base = Color.hsvToRgb(this.h, 1, 1);

        // White to color (horizontal)
        const gradH = ctx.createLinearGradient(0, 0, width, 0);
        gradH.addColorStop(0, 'white');
        gradH.addColorStop(1, `rgb(${base.r}, ${base.g}, ${base.b})`);
        ctx.fillStyle = gradH;
        ctx.fillRect(0, 0, width, height);

        // Transparent to black (vertical)
        const gradV = ctx.createLinearGradient(0, 0, 0, height);
        gradV.addColorStop(0, 'transparent');
        gradV.addColorStop(1, 'black');
        ctx.fillStyle = gradV;
        ctx.fillRect(0, 0, width, height);

        // Update cursor
        this.satCursor.style.left = `${this.s * 100}%`;
        this.satCursor.style.top = `${(1 - this.v) * 100}%`;
    }

    setupEvents() {
        // Saturation area
        const handleSat = e => {
            const rect = this.satArea.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            this.s = Math.max(0, Math.min(1, x / rect.width));
            this.v = Math.max(0, Math.min(1, 1 - y / rect.height));
            this.render();
            this.updateInputs();
        };

        this.satArea.addEventListener('mousedown', e => { this.dragging = 'sat'; handleSat(e); });
        this.satArea.addEventListener('touchstart', e => { e.preventDefault(); this.dragging = 'sat'; handleSat(e); }, { passive: false });

        // Hue area
        const handleHue = e => {
            const rect = this.hueArea.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            this.h = Math.max(0, Math.min(360, (x / rect.width) * 360));
            this.render();
            this.updateInputs();
        };

        this.hueArea.addEventListener('mousedown', e => { this.dragging = 'hue'; handleHue(e); });
        this.hueArea.addEventListener('touchstart', e => { e.preventDefault(); this.dragging = 'hue'; handleHue(e); }, { passive: false });

        // Global move/end
        const onMove = e => {
            if (!this.dragging) return;
            e.preventDefault();
            if (this.dragging === 'sat') handleSat(e);
            else if (this.dragging === 'hue') handleHue(e);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', () => this.dragging = null);
        document.addEventListener('touchend', () => this.dragging = null);

        // Format select
        this.formatSelect.addEventListener('change', () => {
            this.format = this.formatSelect.value;
            this.updateInputs();
        });

        // Copy button
        document.getElementById('copyValueBtn').addEventListener('click', () => {
            const value = this.getFormattedValue();
            navigator.clipboard.writeText(value).then(() => toast.show(`Copied: ${value}`));
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => library.save());
    }

    render() {
        this.drawSaturation();
        
        const rgb = this.getRgb();
        
        // Preview
        this.preview.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        
        // Hue cursor
        this.hueCursor.style.left = `${(this.h / 360) * 100}%`;
        this.hueCursor.style.backgroundColor = `hsl(${this.h}, 100%, 50%)`;
        
        // Sat cursor color
        const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        this.satCursor.style.borderColor = lum > 0.5 ? '#222' : '#fff';
    }

    updateInputs() {
        const rgb = this.getRgb();
        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const hex = Color.rgbToHex(rgb.r, rgb.g, rgb.b);
        
        let html = '';
        
        switch (this.format) {
            case 'hex':
                html = `<input type="text" class="hex-input" value="${hex}" id="hexInput">`;
                break;
            case 'rgb':
                html = `
                    <input type="number" min="0" max="255" value="${rgb.r}" data-channel="r">
                    <input type="number" min="0" max="255" value="${rgb.g}" data-channel="g">
                    <input type="number" min="0" max="255" value="${rgb.b}" data-channel="b">
                `;
                break;
            case 'hsl':
                html = `
                    <input type="number" min="0" max="360" value="${hsl.h}" data-channel="h">
                    <input type="number" min="0" max="100" value="${hsl.s}" data-channel="s">
                    <input type="number" min="0" max="100" value="${hsl.l}" data-channel="l">
                `;
                break;
        }
        
        this.valueInputs.innerHTML = html;
        
        // Add input listeners
        this.valueInputs.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => this.handleInput(input));
            input.addEventListener('keydown', e => e.key === 'Enter' && this.handleInput(input));
        });
    }

    handleInput(input) {
        if (this.format === 'hex') {
            const hex = Color.normalize(input.value);
            if (hex) {
                const rgb = Color.hexToRgb(hex);
                this.setFromRgb(rgb);
            }
        } else if (this.format === 'rgb') {
            const inputs = this.valueInputs.querySelectorAll('input');
            const r = parseInt(inputs[0].value) || 0;
            const g = parseInt(inputs[1].value) || 0;
            const b = parseInt(inputs[2].value) || 0;
            this.setFromRgb({ r: Math.min(255, Math.max(0, r)), g: Math.min(255, Math.max(0, g)), b: Math.min(255, Math.max(0, b)) });
        } else if (this.format === 'hsl') {
            const inputs = this.valueInputs.querySelectorAll('input');
            const h = parseInt(inputs[0].value) || 0;
            const s = parseInt(inputs[1].value) || 0;
            const l = parseInt(inputs[2].value) || 0;
            const rgb = Color.hslToRgb(h, s, l);
            this.setFromRgb(rgb);
        }
    }

    getRgb() {
        return Color.hsvToRgb(this.h, this.s, this.v);
    }

    getFormattedValue() {
        const rgb = this.getRgb();
        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        switch (this.format) {
            case 'hex': return Color.rgbToHex(rgb.r, rgb.g, rgb.b);
            case 'rgb': return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            case 'hsl': return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        }
    }

    getCurrent() {
        const rgb = this.getRgb();
        return { ...rgb, a: 1, hex: Color.rgbToHex(rgb.r, rgb.g, rgb.b) };
    }

    setFromRgb(rgb) {
        const hsv = Color.rgbToHsv(rgb.r, rgb.g, rgb.b);
        this.h = hsv.h;
        this.s = hsv.s;
        this.v = hsv.v;
        this.render();
        this.updateInputs();
    }

    setFromHex(hex) {
        const rgb = Color.hexToRgb(hex);
        if (rgb) this.setFromRgb(rgb);
    }
}

// ============================================
// Library Manager (No localStorage)
// ============================================
class Library {
    constructor() {
        this.colors = [];
        this.settings = { showNames: true, showAdvanced: true };
        this.current = null;

        this.grid = document.getElementById('libraryGrid');
        this.empty = document.getElementById('emptyState');
        this.count = document.getElementById('colorCount');
        this.search = document.getElementById('searchInput');

        this.render();
        this.setupEvents();
    }

    setupEvents() {
        this.search.addEventListener('input', () => this.render(this.search.value));

        document.getElementById('exportBtn').addEventListener('click', () => this.export());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('fileInput').addEventListener('change', e => this.import(e));

        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.querySelector('#colorModal .modal-backdrop').addEventListener('click', () => this.closeModal());

        document.getElementById('deleteColorBtn').addEventListener('click', () => {
            if (this.current) {
                this.delete(this.current.id);
                this.closeModal();
            }
        });

        // Settings
        document.getElementById('showNamesToggle').addEventListener('change', e => {
            this.settings.showNames = e.target.checked;
            this.render();
        });

        document.getElementById('showAdvancedToggle').addEventListener('change', e => {
            this.settings.showAdvanced = e.target.checked;
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            if (confirm('Delete all colors?')) {
                this.colors = [];
                this.render();
                settingsModal.classList.remove('active');
                toast.show('All colors deleted');
            }
        });
    }

    save() {
        const color = picker.getCurrent();
        const name = document.getElementById('colorNameInput').value.trim() || Color.getName(color.hex);

        if (this.colors.some(c => c.hex === color.hex)) {
            toast.show('Color already saved');
            return;
        }

        this.colors.unshift({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            hex: color.hex, r: color.r, g: color.g, b: color.b, a: color.a,
            name, createdAt: Date.now()
        });

        this.render();
        document.getElementById('colorNameInput').value = '';
        toast.show('Color saved!');
    }

    delete(id) {
        this.colors = this.colors.filter(c => c.id !== id);
        this.render();
        toast.show('Color deleted');
    }

    render(filter = '') {
        let list = this.colors;
        
        if (filter) {
            const q = filter.toLowerCase();
            list = this.colors.filter(c => c.hex.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
        }

        this.count.textContent = this.colors.length;
        this.grid.innerHTML = '';

        if (list.length === 0) {
            this.empty.style.display = 'flex';
            this.grid.style.display = 'none';
            return;
        }

        this.empty.style.display = 'none';
        this.grid.style.display = 'grid';

        list.forEach(c => {
            const el = document.createElement('div');
            el.className = 'swatch';
            el.innerHTML = `
                <div class="swatch-color" style="background: rgb(${c.r}, ${c.g}, ${c.b})"></div>
                ${this.settings.showNames ? `<div class="swatch-name">${c.name}</div>` : ''}
            `;
            el.addEventListener('click', () => this.openModal(c));
            this.grid.appendChild(el);
        });
    }

    openModal(color) {
        this.current = color;
        const modal = document.getElementById('colorModal');
        
        // Preview - solid color
        document.getElementById('modalPreview').style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        document.getElementById('modalColorName').textContent = color.name;

        // Formats
        const formats = Color.formats(color.r, color.g, color.b);
        const order = ['hex', 'rgb', 'hsl'];
        if (this.settings.showAdvanced) order.push('lab', 'lch');

        document.getElementById('modalFormats').innerHTML = order.map(key => `
            <div class="format-item">
                <span class="label">${key}</span>
                <span class="value">${formats[key]}</span>
                <button class="copy" data-value="${formats[key]}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
            </div>
        `).join('');

        document.querySelectorAll('#modalFormats .copy').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.value);
                toast.show(`Copied: ${btn.dataset.value}`);
            });
        });

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('colorModal').classList.remove('active');
    }

    export() {
        if (!this.colors.length) {
            toast.show('No colors to export');
            return;
        }
        const data = JSON.stringify(this.colors, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chromavault-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.show('Exported!');
    }

    import(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                if (Array.isArray(data)) {
                    let added = 0;
                    data.forEach(c => {
                        if (!this.colors.some(x => x.hex === c.hex)) {
                            this.colors.push(c);
                            added++;
                        }
                    });
                    this.render();
                    toast.show(`Imported ${added} colors`);
                }
            } catch {
                toast.show('Invalid file');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }
}

// ============================================
// Initialize
// ============================================
const picker = new Picker();
const library = new Library();

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        library.closeModal();
        settingsModal.classList.remove('active');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        library.save();
    }
});