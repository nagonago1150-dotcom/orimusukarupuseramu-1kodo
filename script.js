let currentQuestion = 1;
const answers = {};
const redirectUrl = 'https://pthree.jp/lp?u=media8';

// タイピングアニメーション関数（強化版 - 各文字にエフェクト）
function typeWriter(element, text, speed = 40) {
    // prefers-reduced-motionチェック
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.innerHTML = text;
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        let i = 0;
        element.innerHTML = '';
        element.style.opacity = '1';

        function type() {
            if (i < text.length) {
                if (text.charAt(i) === '<') {
                    // HTMLタグをそのまま処理
                    const closingIndex = text.indexOf('>', i);
                    element.innerHTML += text.substring(i, closingIndex + 1);
                    i = closingIndex + 1;
                } else {
                    const char = text.charAt(i);
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.className = 'typing-char';
                    span.style.animationDelay = (i * 0.03) + 's';
                    element.appendChild(span);
                    i++;
                }
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// チェックマークを追加する関数（軽量実装）
function addCheckmark(button) {
    const checkmark = document.createElement('div');
    checkmark.className = 'success-checkmark';
    checkmark.innerHTML = `
        <svg viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
    `;
    button.appendChild(checkmark);
}

// サクセスパーティクルを生成する関数（強化版）
function createSuccessParticles(button, event) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const rect = button.getBoundingClientRect();
    const centerX = event.clientX;
    const centerY = event.clientY;

    // 12個のパーティクルで派手に
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'success-particle';

        const angle = (i * 30) * Math.PI / 180;
        const distance = 80 + Math.random() * 60;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.left = (centerX - rect.left) + 'px';
        particle.style.top = (centerY - rect.top) + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        // ランダムな遅延でより動的に
        particle.style.animationDelay = (Math.random() * 0.1) + 's';

        button.appendChild(particle);

        setTimeout(() => particle.remove(), 1100);
    }
}

// パーセント表示のカウントアップアニメーション（軽量実装）
function animatePercent(element, targetPercent) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.textContent = targetPercent + '%';
        return;
    }

    let current = 0;
    const increment = targetPercent / 30;
    const duration = 800;
    const stepTime = duration / 30;

    const timer = setInterval(() => {
        current += increment;
        if (current >= targetPercent) {
            current = targetPercent;
            clearInterval(timer);
        }
        element.textContent = Math.round(current) + '%';
    }, stepTime);
}

// カスタムカーソルの初期化
function initCursor() {
    const cursor = document.createElement('div');
    const cursorFollower = document.createElement('div');
    cursor.className = 'cursor';
    cursorFollower.className = 'cursor-follower';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorFollower);
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    
    // マウス位置を記録
    document.addEventListener('mousemove', (e) => {
        mouseX = e.pageX;
        mouseY = e.pageY;
    });
    
    // カーソルのアニメーション
    function animateCursor() {
        // メインカーソル（遅延なし）
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
        
        // フォロワー（スムーズな追従）
        const dx = mouseX - followerX;
        const dy = mouseY - followerY;
        followerX += dx * 0.15;
        followerY += dy * 0.15;
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // ホバー時のカーソル変化
    const interactiveElements = '.option-button, button, a, .product-image, .product-link';
    
    document.addEventListener('mouseover', (e) => {
        if (e.target.matches(interactiveElements)) {
            cursor.classList.add('cursor-hover');
            cursorFollower.classList.add('cursor-hover');
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.matches(interactiveElements)) {
            cursor.classList.remove('cursor-hover');
            cursorFollower.classList.remove('cursor-hover');
        }
    });
    
    // マウスがウィンドウから出た時
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorFollower.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        cursorFollower.style.opacity = '1';
    });
}

function selectAnswer(questionNumber, answer) {
    answers[`question${questionNumber}`] = answer;

    const button = event.target.closest('.option-button');
    const allButtons = button.parentElement.querySelectorAll('.option-button');

    // 他のボタンをフェードアウト
    allButtons.forEach(btn => {
        if (btn !== button) {
            btn.style.opacity = '0.4';
            btn.style.transform = 'scale(0.98)';
            btn.style.pointerEvents = 'none';
            btn.style.filter = 'none';
        }
    });

    // 選択されたボタンにエフェクト
    button.classList.add('selected');
    button.style.background = 'var(--accent-gradient)';
    button.style.color = '#fff';
    button.style.transform = 'translateY(-2px) scale(1.02)';
    button.style.boxShadow = '0 8px 20px rgba(245, 179, 192, 0.3)';

    // リップルエフェクトを追加
    createRipple(button, event);

    // チェックマークを追加
    addCheckmark(button);

    // サクセスパーティクルを生成
    createSuccessParticles(button, event);

    // 振動フィードバック（対応デバイスのみ）
    if (navigator.vibrate) {
        navigator.vibrate([30, 10, 30]);
    }

    setTimeout(() => {
        if (questionNumber < 3) {
            showNextQuestion();
        } else {
            showLoading();
        }
    }, 1000);
}

function createRipple(button, event) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 1000);
}

function showNextQuestion() {
    const currentSection = document.querySelector('.section.active');
    const container = currentSection.querySelector('.container');
    
    // コンテナをフェードアウト
    container.style.transform = 'translateX(-20px)';
    container.style.opacity = '0';
    currentSection.classList.add('fade-out');
    
    setTimeout(() => {
        currentSection.classList.remove('active', 'fade-out');
        currentQuestion++;
        const nextSection = document.getElementById(`section${currentQuestion}`);
        
        // 質問番号を追加
        addQuestionNumber(nextSection, currentQuestion);
        
        // プログレスバーのアニメーション
        const progressFill = nextSection.querySelector('.progress-fill');
        const progressPercent = nextSection.querySelector('.progress-percent');
        if (progressFill) {
            progressFill.style.width = '0%';
            setTimeout(() => {
                const targetWidth = currentQuestion === 2 ? '66.67%' : '100%';
                const targetPercent = currentQuestion === 2 ? 67 : 100;
                progressFill.style.width = targetWidth;

                // パーセント表示をカウントアップ
                if (progressPercent) {
                    setTimeout(() => {
                        animatePercent(progressPercent, targetPercent);
                    }, 400);
                }
            }, 200);
        }
        
        nextSection.classList.add('active');

        // 新しいセクションのコンテナを3D効果でフェードイン
        const newContainer = nextSection.querySelector('.container');
        newContainer.style.transform = 'translateX(50px) translateZ(-200px) rotateY(15deg)';
        newContainer.style.opacity = '0';

        setTimeout(() => {
            newContainer.style.transform = 'translateX(0) translateZ(0) rotateY(0deg)';
            newContainer.style.opacity = '1';
            newContainer.style.transition = 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 100);
        
        // ボタンのスタガーアニメーション
        const buttons = nextSection.querySelectorAll('.option-button');
        buttons.forEach((btn, index) => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(20px)';
            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
                btn.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }, 200 + index * 100);
        });
        
        // カーソルイベントを再設定
        updateCursorEvents();
    }, 600);
}

function addQuestionNumber(section, number) {
    const existingNumber = section.querySelector('.question-number');
    if (!existingNumber) {
        const numberEl = document.createElement('div');
        numberEl.className = 'question-number';
        numberEl.textContent = number;
        section.appendChild(numberEl);
    }
}

function showLoading() {
    const currentSection = document.querySelector('.section.active');
    currentSection.classList.add('fade-out');

    setTimeout(() => {
        currentSection.classList.remove('active', 'fade-out');
        const loadingSection = document.getElementById('loading-section');
        loadingSection.classList.add('active');

        // ローディングテキストの段階的表示
        const elements = loadingSection.querySelectorAll('.thank-you, .leading-text, .loading-text');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }, 200 + index * 400);
        });

        // 波紋アニメーションの強化
        const ripples = loadingSection.querySelectorAll('.ripple');
        ripples.forEach((ripple, index) => {
            ripple.style.animationDelay = index * 1.5 + 's';
        });

        // プログレスバーアニメーション
        const progressFill = loadingSection.querySelector('.loading-progress-fill');
        const progressPercent = loadingSection.querySelector('.loading-progress-percent');

        setTimeout(() => {
            let progress = 0;
            const duration = 2500;
            const interval = 30;
            const increment = 100 / (duration / interval);

            const progressTimer = setInterval(() => {
                progress += increment;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressTimer);
                }
                progressFill.style.width = progress + '%';
                progressPercent.textContent = Math.round(progress) + '%';
            }, interval);
        }, 1200);

        // リダイレクト
        setTimeout(() => {
            // フェードトゥホワイト
            const fadeOverlay = document.createElement('div');
            fadeOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                opacity: 0;
                z-index: 9999;
                transition: opacity 1s ease;
            `;
            document.body.appendChild(fadeOverlay);

            setTimeout(() => {
                fadeOverlay.style.opacity = '1';
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            }, 100);
        }, 4000);
    }, 600);
}

function updateCursorEvents() {
    // 新しい要素のホバーイベントは、既存のイベントリスナーで自動的に処理されるため、
    // この関数は不要になりました
}

document.addEventListener('DOMContentLoaded', async function() {
    // ページフラッシュエフェクト
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const flash = document.createElement('div');
        flash.className = 'page-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 1500);
    }

    // カスタムカーソルの初期化
    if (window.matchMedia('(pointer: fine)').matches) {
        initCursor();
    } else {
        document.body.style.cursor = 'auto';
    }

    // 最初の質問番号を追加
    const firstSection = document.querySelector('.section.active');
    addQuestionNumber(firstSection, 1);

    // 初期アニメーション
    const mainVisual = firstSection.querySelector('.main-visual');
    const mainCopy = firstSection.querySelector('.main-copy');
    const questionArea = firstSection.querySelector('.question-area');

    // メインビジュアルは自動アニメーション（CSS側で処理）

    // タイピングアニメーション実行
    setTimeout(async () => {
        const copyLine1 = mainCopy.querySelector('.copy-line1');
        const copyLine2 = mainCopy.querySelector('.copy-line2');

        await typeWriter(copyLine1, copyLine1.dataset.text, 40);
        await typeWriter(copyLine2, copyLine2.dataset.text, 40);

        // 質問エリアをダイナミックに「ドンッ」と落とす
        questionArea.style.opacity = '0';
        questionArea.style.transform = 'translateY(-60px)';
        setTimeout(() => {
            questionArea.style.opacity = '1';
            questionArea.style.transform = 'translateY(0)';
            questionArea.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';

            // 質問文にタイピングアニメーション
            const questionTitle = questionArea.querySelector('.question-title');
            setTimeout(async () => {
                if (questionTitle && questionTitle.dataset.text) {
                    await typeWriter(questionTitle, questionTitle.dataset.text, 50);
                }

                // ボタンを個別に弾ませる
                const buttons = questionArea.querySelectorAll('.option-button');
                buttons.forEach((btn, index) => {
                    btn.style.opacity = '0';
                    btn.style.transform = 'translateY(50px) scale(0.5) rotate(-10deg)';
                    setTimeout(() => {
                        btn.style.opacity = '1';
                        btn.style.transform = 'translateY(0) scale(1) rotate(0deg)';
                        btn.style.transition = 'all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

                        // アニメーション完了後、CSSアニメーションを削除してクリック可能にする
                        setTimeout(() => {
                            btn.style.removeProperty('opacity');
                            btn.style.removeProperty('transform');
                            btn.style.removeProperty('transition');
                            btn.classList.add('animation-complete');
                        }, 750);
                    }, 100 + index * 150);
                });
            }, 300);
        }, 400);
    }, 1200);
    
    // ボタンのマイクロインタラクション（マグネティック効果強化）
    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach(button => {
        // マグネティック効果（カーソルに引き寄せられる動き）
        button.addEventListener('mousemove', function(e) {
            if (!this.classList.contains('selected')) {
                const rect = this.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // カーソルとボタン中心の距離を計算
                const deltaX = (e.clientX - centerX) * 0.15;
                const deltaY = (e.clientY - centerY) * 0.15;

                // 3D的な傾きを追加
                const rotateX = ((e.clientY - centerY) / rect.height) * -5;
                const rotateY = ((e.clientX - centerX) / rect.width) * 5;

                this.style.transform = `
                    translateY(-3px)
                    translateX(${deltaX}px)
                    translateZ(0)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                `;
                this.style.transition = 'transform 0.1s ease-out';
            }
        });

        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(0) translateX(0) rotateX(0) rotateY(0)';
                this.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }
        });
    });
    
    // パララックスエフェクト
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        
        document.querySelectorAll('.particle').forEach((particle, index) => {
            const speed = (index + 1) * 0.5;
            particle.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
    
    // パーティクルエフェクト（背景）
    createParticles();
});

function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 30 + 's';
        particle.style.animationDuration = (30 + Math.random() * 30) + 's';
        particle.style.width = particle.style.height = (2 + Math.random() * 4) + 'px';
        particlesContainer.appendChild(particle);
    }
}

// CSSスタイルを動的に追加（リップルエフェクトのみ）
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
        transform: scale(0);
        animation: rippleSpread 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        pointer-events: none;
    }

    @keyframes rippleSpread {
        to {
            transform: scale(5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);