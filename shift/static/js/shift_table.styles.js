let colorMap;  // グローバル変数として定義

// ページ読み込み時に実行
window.onload = function() {
    const cells = document.querySelectorAll('td[data-status]');
    const uniqueStatuses = new Set();
    
    // まず、ユニークなポジション名を収集（休憩を含む）
    cells.forEach(cell => {
        const status = cell.getAttribute('data-status');
        if (status && status.trim() !== '') {
            uniqueStatuses.add(status);
        }
    });
    
    // ポジション名の配列を作成
    const statusArray = Array.from(uniqueStatuses);
    colorMap = new Map();  // グローバル変数に代入
    
    // 休憩の色を固定で設定
    colorMap.set('休憩', '#e6f7ff');

    // 各ポジションに色を割り当て（休憩以外）
    statusArray.filter(status => status !== '休憩').forEach((status, index) => {
        const hue = (index / (statusArray.length - 1)) * 360;
        colorMap.set(status, `hsl(${hue}, 85%, 90%)`);
    });
    
    // セルに色を適用
    cells.forEach(cell => {
        const status = cell.getAttribute('data-status');
        if (status && status.trim() !== '') {
            cell.style.backgroundColor = colorMap.get(status);
        }
    });

    // セルクリックイベントの追加
    cells.forEach(cell => {
        cell.addEventListener('click', function(e) {
            e.preventDefault();
            showPositionModal(this);  // 休憩のチェックを削除
        });
    });

    // スタッフ名セルのクリックイベントを追加
    const staffNameCells = document.querySelectorAll('.staff-name-row td');
    staffNameCells.forEach(cell => {
        cell.addEventListener('click', function() {
            const currentText = this.textContent.trim();
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText;
            input.style.width = '90%';
            input.style.textAlign = 'center';
            
            // 入力欄でEnterを押すか、フォーカスが外れたときに確定
            input.addEventListener('blur', finishEditing);
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    this.blur();
                }
            });

            this.textContent = '';
            this.appendChild(input);
            input.focus();

            function finishEditing() {
                const newName = input.value.trim();
                cell.textContent = newName;
            }
        });
    });
};

// モーダルウィンドウを表示する関数
function showPositionModal(cell) {
    // 既存のモーダルを削除
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    // 全ポジションを取得（休憩を含む）
    const allPositions = new Set();
    document.querySelectorAll('td[data-status]').forEach(td => {
        const status = td.getAttribute('data-status');
        if (status && status.trim() !== '') {
            allPositions.add(status);
        }
    });

    // モーダルウィンドウを作成
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = '<h3>ポジションを選択</h3>';

    // ポジションボタンを作成
    Array.from(allPositions).forEach(position => {
        const button = document.createElement('button');
        button.className = 'position-button';
        button.textContent = position;
        button.style.backgroundColor = colorMap.get(position);
        button.onclick = () => {
            cell.textContent = position;
            cell.setAttribute('data-status', position);
            cell.style.backgroundColor = colorMap.get(position);
            modal.remove();
        };
        modalContent.appendChild(button);
    });

    // キャンセルボタン
    const cancelButton = document.createElement('button');
    cancelButton.className = 'position-button';
    cancelButton.textContent = 'キャンセル';
    cancelButton.style.backgroundColor = '#f0f0f0';
    cancelButton.onclick = () => modal.remove();
    modalContent.appendChild(cancelButton);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // モーダル外クリックで閉じる
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Excelダウンロード関数を修正
function downloadExcel() {
    // シフトデータの収集
    const table = document.getElementById('shift-table');
    const shiftData = [];
    
    // テーブルの各行を処理
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        const rowData = [];
        
        // 各セルのデータを取得
        for (let j = 0; j < row.cells.length; j++) {
            const cell = row.cells[j];
            // スタッフ名の行の場合
            if (row.classList.contains('staff-name-row')) {
                rowData.push(cell.textContent.trim());
            }
            // 通常のシフトセルの場合
            else if (cell.hasAttribute('data-status')) {
                rowData.push(cell.getAttribute('data-status'));
            }
            // その他のセル（時間など）
            else {
                rowData.push(cell.textContent.trim());
            }
        }
        shiftData.push(rowData);
    }
    
    // カラーマップの取得（現在の表示色を使用）
    const colorMap = {};
    document.querySelectorAll('td[data-status]').forEach(cell => {
        const status = cell.getAttribute('data-status');
        if (status) {
            const computedStyle = window.getComputedStyle(cell);
            const bgColor = computedStyle.backgroundColor;
            // RGB形式を16進数に変換
            const rgb = bgColor.match(/\d+/g);
            if (rgb) {
                const hexColor = '#' + rgb.map(x => {
                    const hex = parseInt(x).toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
                colorMap[status] = hexColor;
            }
        }
    });
    
    // APIにデータを送信
    fetch('/download_excel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            shift_data: shiftData,
            color_map: colorMap
        })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shift_table.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    });
}

// JPEG画像としてダウンロード
function downloadJPEG() {
    const table = document.querySelector('table');
    html2canvas(table, {
        backgroundColor: '#ffffff',
        scale: 2  // 高解像度で出力
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'シフト表.jpeg';
        link.href = canvas.toDataURL('image/jpeg', 1.0);
        link.click();
    });
} 