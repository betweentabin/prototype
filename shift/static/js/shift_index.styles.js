/**
 * シフトインデックス JavaScript
 * 
 * このファイルはシフト管理ツールの機能を実装するJavaScriptコードです。
 */

document.addEventListener('DOMContentLoaded', () => {
    // ===== 機能カードのアクティブ状態の処理 =====
    const featureCards = document.querySelectorAll('.feature-card');
    
    // まず全てのカードからactiveクラスを削除
    featureCards.forEach(card => {
      card.classList.remove('active');
    });
    
    // 休憩シフトカード（インデックス2）をアクティブにする
    if (featureCards.length >= 3) {
      featureCards[2].classList.add('active');
      // アクティブカードのクリックイベントを無効化
      featureCards[2].style.pointerEvents = 'none';
    }
    
    featureCards.forEach((card, index) => {
      // 休憩シフトカード以外にのみクリックイベントを追加
      if (index !== 2) {
        card.addEventListener('click', function() {
          // クリック時のビジュアルフィードバック
          featureCards.forEach(c => c.classList.remove('active'));
          this.classList.add('active');
        });
      }
    });

    // ===== 時間入力フィールドの設定 =====
    const timeInputs = document.querySelectorAll('input[type="time"]');
    timeInputs.forEach(input => {
        // step属性を設定（ブラウザの時間選択UIで15分単位のみ表示）
        input.setAttribute('step', '900');
        
        // 時間入力フィールドのクリックイベント
        input.addEventListener('click', function(e) {
            // デフォルトの時間選択UIを表示させない
            e.preventDefault();
            
            // 現在の値を取得
            let currentHours = 0;
            let currentMinutes = 0;
            
            if (this.value) {
                const [hours, minutes] = this.value.split(':').map(Number);
                currentHours = hours;
                currentMinutes = minutes;
            }
            
            // カスタム時間選択UIを作成
            const timePickerContainer = document.createElement('div');
            timePickerContainer.className = 'time-picker-container';
            timePickerContainer.style.position = 'absolute';
            timePickerContainer.style.zIndex = '1000';
            timePickerContainer.style.backgroundColor = 'white';
            timePickerContainer.style.border = '1px solid #ddd';
            timePickerContainer.style.borderRadius = '8px';
            timePickerContainer.style.padding = '15px';
            timePickerContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            timePickerContainer.style.width = '250px';
            
            // 時間選択部分
            const hoursContainer = document.createElement('div');
            hoursContainer.style.display = 'inline-block';
            hoursContainer.style.marginRight = '15px';
            hoursContainer.style.width = '45%';
            
            const hoursLabel = document.createElement('div');
            hoursLabel.textContent = '時間';
            hoursLabel.style.textAlign = 'center';
            hoursLabel.style.marginBottom = '8px';
            hoursLabel.style.fontWeight = '600';
            hoursLabel.style.color = '#333';
            
            const hoursSelect = document.createElement('select');
            hoursSelect.style.width = '100%';
            hoursSelect.style.padding = '0.75rem';
            hoursSelect.style.border = '1px solid #ddd';
            hoursSelect.style.borderRadius = '8px';
            hoursSelect.style.fontSize = '1rem';
            hoursSelect.style.backgroundColor = 'white';
            
            for (let i = 0; i < 24; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i.toString().padStart(2, '0');
                if (i === currentHours) {
                    option.selected = true;
                }
                hoursSelect.appendChild(option);
            }
            
            hoursContainer.appendChild(hoursLabel);
            hoursContainer.appendChild(hoursSelect);
            
            // 分選択部分（15分単位のみ）
            const minutesContainer = document.createElement('div');
            minutesContainer.style.display = 'inline-block';
            minutesContainer.style.width = '45%';
            
            const minutesLabel = document.createElement('div');
            minutesLabel.textContent = '分';
            minutesLabel.style.textAlign = 'center';
            minutesLabel.style.marginBottom = '8px';
            minutesLabel.style.fontWeight = '600';
            minutesLabel.style.color = '#333';
            
            const minutesSelect = document.createElement('select');
            minutesSelect.style.width = '100%';
            minutesSelect.style.padding = '0.75rem';
            minutesSelect.style.border = '1px solid #ddd';
            minutesSelect.style.borderRadius = '8px';
            minutesSelect.style.fontSize = '1rem';
            minutesSelect.style.backgroundColor = 'white';
            
            // 15分単位の選択肢のみ追加
            const minuteOptions = [0, 15, 30, 45];
            minuteOptions.forEach(minute => {
                const option = document.createElement('option');
                option.value = minute;
                option.textContent = minute.toString().padStart(2, '0');
                
                // 現在の分に最も近い値を選択
                if (minute === currentMinutes || 
                    (minute > currentMinutes && minute - currentMinutes < 15) ||
                    (minute < currentMinutes && currentMinutes - minute > 30)) {
                    option.selected = true;
                }
                
                minutesSelect.appendChild(option);
            });
            
            minutesContainer.appendChild(minutesLabel);
            minutesContainer.appendChild(minutesSelect);
            
            // 確定ボタン
            const confirmButton = document.createElement('button');
            confirmButton.textContent = '確定';
            confirmButton.style.display = 'block';
            confirmButton.style.width = '100%';
            confirmButton.style.marginTop = '15px';
            confirmButton.style.padding = '0.75rem';
            confirmButton.style.backgroundColor = '#8B9CDB'; // primary-color
            confirmButton.style.color = 'white';
            confirmButton.style.border = 'none';
            confirmButton.style.borderRadius = '8px';
            confirmButton.style.cursor = 'pointer';
            confirmButton.style.fontSize = '1rem';
            confirmButton.style.fontWeight = '600';
            confirmButton.style.transition = 'background-color 0.3s';
            
            // ホバー効果
            confirmButton.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#7A8BC9'; // 少し暗い色
            });
            
            confirmButton.addEventListener('mouseout', function() {
                this.style.backgroundColor = '#8B9CDB';
            });
            
            confirmButton.addEventListener('click', function(e) {
                e.preventDefault();
                const selectedHours = hoursSelect.value.toString().padStart(2, '0');
                const selectedMinutes = minutesSelect.value.toString().padStart(2, '0');
                input.value = `${selectedHours}:${selectedMinutes}`;
                document.body.removeChild(timePickerContainer);
                
                // 次のフィールドにフォーカスを移動
                const form = input.closest('form');
                const inputs = Array.from(form.querySelectorAll('input, select, textarea, button:not([type="button"])')).filter(el => !el.disabled && el.type !== 'hidden');
                const currentIndex = inputs.indexOf(input);
                const nextInput = inputs[currentIndex + 1] || inputs[0];
                nextInput.focus();
            });
            
            // UIを組み立てる
            timePickerContainer.appendChild(hoursContainer);
            timePickerContainer.appendChild(minutesContainer);
            timePickerContainer.appendChild(confirmButton);
            
            // 位置調整
            const inputRect = this.getBoundingClientRect();
            timePickerContainer.style.top = `${inputRect.bottom + window.scrollY + 5}px`;
            timePickerContainer.style.left = `${inputRect.left + window.scrollX}px`;
            
            // UIを表示
            document.body.appendChild(timePickerContainer);
            
            // 外側をクリックしたら閉じる
            document.addEventListener('click', function closeTimePicker(e) {
                if (!timePickerContainer.contains(e.target) && e.target !== input) {
                    document.body.removeChild(timePickerContainer);
                    document.removeEventListener('click', closeTimePicker);
                }
            });
        });
        
        // キー入力イベントの処理を追加
        input.addEventListener('keydown', function(e) {
            // エンターキーが押された場合
            if (e.key === 'Enter') {
                e.preventDefault(); // デフォルトの送信動作を防止
                
                // 現在のフィールドの値を15分単位に切り上げる
                if (this.value) {
                    const [hours, minutes] = this.value.split(':').map(Number);
                    const totalMinutes = hours * 60 + minutes;
                    // 15分単位で切り上げる
                    const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
                    const newHours = Math.floor(roundedMinutes / 60) % 24;
                    const newMinutes = roundedMinutes % 60;
                    this.value = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
                }
                
                // フォーム内の全入力フィールドを取得
                const form = this.closest('form');
                const inputs = Array.from(form.querySelectorAll('input, select, textarea, button:not([type="button"])')).filter(el => !el.disabled && el.type !== 'hidden');
                
                // 現在のフィールドのインデックスを取得
                const currentIndex = inputs.indexOf(this);
                
                // 次のフィールドにフォーカスを移動（最後のフィールドの場合は最初に戻る）
                const nextInput = inputs[currentIndex + 1] || inputs[0];
                nextInput.focus();
            }
        });
        
        // フォーカスが外れたときに15分単位に切り上げる
        input.addEventListener('blur', function() {
            if (this.value) {
                const [hours, minutes] = this.value.split(':').map(Number);
                const totalMinutes = hours * 60 + minutes;
                // 15分単位で切り上げる（Math.ceilを使用）
                const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
                const newHours = Math.floor(roundedMinutes / 60) % 24; // 24時間を超える場合に対応
                const newMinutes = roundedMinutes % 60;
                this.value = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
            }
        });
    });

    // ===== シフト生成フォームの処理 =====
    const shiftForm = document.querySelector('.shift-generator');
    if (shiftForm) {
        // ポジション追加ボタンの処理
        const positionAddBtn = document.getElementById('add-position');
        const positionInputs = shiftForm.querySelector('.position-inputs');
        
        positionAddBtn.addEventListener('click', () => {
            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'input-wrapper';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.placeholder = 'ポジション名';
            input.name = 'position_names';
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', () => {
                inputWrapper.remove();
            });
            
            inputWrapper.appendChild(input);
            inputWrapper.appendChild(removeBtn);
            positionInputs.appendChild(inputWrapper);
        });
        
        // 臨時ポジション追加ボタンの処理
        const tempPositionAddBtn = document.getElementById('add-extra-position');
        const tempPositionInputs = shiftForm.querySelector('.temp-position-inputs');
        
        tempPositionAddBtn.addEventListener('click', () => {
            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'input-wrapper';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.placeholder = '臨時ポジション名';
            input.name = 'extra_positions';
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', () => {
                inputWrapper.remove();
            });
            
            inputWrapper.appendChild(input);
            inputWrapper.appendChild(removeBtn);
            tempPositionInputs.appendChild(inputWrapper);
        });
        
        // 個人休憩時間の表示/非表示の切り替え
        const breakTypeRadios = shiftForm.querySelectorAll('input[name="exceptional_break"]');
        const breakDetails = shiftForm.querySelector('.break-details');
        
        breakTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'あり' && radio.checked) {
                    breakDetails.style.display = 'flex';
                } else {
                    breakDetails.style.display = 'none';
                }
            });
        });
        
        // 初期状態で個人休憩時間の詳細を非表示にする
        if (breakTypeRadios[0].checked) {
            breakDetails.style.display = 'none';
        }
        
        // フォーム送信処理はHTMLのaction属性とmethod属性に任せるため削除
        // shiftForm.addEventListener('submit', (e) => { ... });
    }
});