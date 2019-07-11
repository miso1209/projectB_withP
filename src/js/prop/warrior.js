import PropBase from './propbase';

export default class Warrior extends PropBase {
    constructor(x, y, tileData) {
        super(x, y, tileData);

        this.isInteractive = true;
        this.isOpened = false;
        this.alreadyParty = false;

        this.hasEmitter = true;
        this.healed = false;

        // name tag의 offset을 설정할 수 있도록 한다.
        this.nameTagOffset = {
            x: -10,
            y: -(this.tileTexture.height / 3)
        };
        // 초기에 이름을 보이고, hideName을 오버라이딩 하여, hide 하지 않도록 한다.
        this.displayName = 'Lv.1 ???';
        this.showName();
    }

    applyTag(tag) {
        if (tag === "haswarrior") {
            this.delete();
        }
        // 퀘스트로 처리해야 할 것 같은데.. 우선 tag로 처리해둔다..
        if (tag === "healWarrior") {
            this.healed = true;
            this.tileTexture.texture = PIXI.Texture.fromFrame("healer_warrior_alive.png");
            this.nameTagOffset = {
                x: -15,
                y: -(this.tileTexture.height / 2)
            };
            this.displayName = 'Lv.1 전사';
            this.showName();
        }
    }

    delete() {
        if (!this.alreadyParty) {
            this.alreadyParty = true;
            this.emit('delete');
        }
    }

    touch(game) {
        if (!this.alreadyParty) {
            const potionCount = game.player.inventory.getCount(3001);
            const healedDialog = async () => {
                game.exploreMode.interactive = false;
                game.ui.hideMenu();

                game.ui.showDialog([
                    { speaker: 2, text: "정말 감사합니다.. 어떻게 감사의 말씀을 드려야할지.." },
                    { speaker: 1, text: "아닙니다. 건강해지셔서 정말 다행입니다." },
                    { speaker: 3, text: "이 은혜를 어떻게 갚아야 할지 모르겠네요." },
                    { speaker: 1, text: "괜찮으시다면 저와 탑을 올라주실수 있을까요" },
                    { speaker: 2, text: "저희도 성에 볼일이 있었는데 잘 되었네요!. 가시죠!." }
                ], async () => {
                    game.exploreMode.interactive = false;
                    game.ui.hideMenu();
                    await game.$fadeOut(1);

                    game.addCharacter(2, { level: 1, exp: 0, equips: {}});
                    game.addCharacter(3, { level: 1, exp: 0, equips: {}});
                    game.addTag("haswarrior");
                    this.delete();

                    await game.$fadeIn(1);
                    game.ui.showMenu();
                    game.exploreMode.interactive = true;
                });
            }

            if (!game.player.hasQuest(5) && !this.healed) {
                game.exploreMode.interactive = false;
                game.ui.hideMenu();

                game.ui.showDialog([
                    { speaker: 1, text: "저기요 괜찮으세요?" },
                    { text: "..." },
                    { speaker: 1, text: "아무래도 포션을 만들어서 회복시켜줘야겠어!." },
                    { speaker: 1, text: "집으로 돌아가서 포션을 만들자!." }
                ], () => {
                    game.addQuest(2);
                    game.addQuest(5);
                    game.ui.showMenu();
                    game.exploreMode.interactive = true;
                });
            } else if(this.healed) {
                healedDialog();
            } else if(potionCount >= 1) {
                const t = async () => {
                    game.exploreMode.interactive = false;
                    game.ui.hideMenu();
                    await game.$fadeOut(1);

                    game.addTag("healWarrior");
                    this.healed = true;
                    this.tileTexture.texture = PIXI.Texture.fromFrame("healer_warrior_alive.png");
                    this.nameTagOffset = {
                        x: -15,
                        y: -(this.tileTexture.height / 2)
                    };
                    this.displayName = 'Lv.1 전사';
                    this.showName();

                    await game.$fadeIn(1);
                    await healedDialog();
                }

                game.ui.showConfirmModal("회복 시키시겠습니까?", true, (confirmed) => {
                    if (confirmed === "ok") {
                        t();
                    }
                });
            } else {

            }
        }
    }

    hideName() {

    }

    getName() {
        return this.displayName;
    }
}