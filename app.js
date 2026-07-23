(() => {
"use strict";

/* 完全スタンドアロン：fetch不使用。敵データは直接内蔵。 */
const STORAGE_KEY="border-trpg-ultimate-v1";

const ENEMIES = {"slime": {"name": "スライム", "baseHp": 30, "baseAttack": 5, "baseDefense": 1, "baseExp": 10, "gold": 5, "desc": "ぷるぷるした魔物。"}, "shadow": {"name": "黒い影", "baseHp": 50, "baseAttack": 8, "baseDefense": 3, "baseExp": 25, "gold": 12, "desc": "不気味な影。"}, "goblin": {"name": "ゴブリン", "baseHp": 80, "baseAttack": 12, "baseDefense": 5, "baseExp": 40, "gold": 20, "desc": "小さく素早い魔物。"}, "wolf": {"name": "灰色狼", "baseHp": 100, "baseAttack": 16, "baseDefense": 6, "baseExp": 55, "gold": 30, "desc": "群れで狩る獣。"}, "orc": {"name": "オーク", "baseHp": 180, "baseAttack": 22, "baseDefense": 12, "baseExp": 90, "gold": 55, "desc": "強靭な肉体を持つ魔物。"}, "skeleton": {"name": "スケルトン", "baseHp": 120, "baseAttack": 18, "baseDefense": 8, "baseExp": 70, "gold": 40, "desc": "骨だけの戦士。"}, "vampire": {"name": "ヴァンパイア", "baseHp": 260, "baseAttack": 30, "baseDefense": 15, "baseExp": 160, "gold": 100, "desc": "血を吸う夜の怪物。"}, "golem": {"name": "ストーンゴーレム", "baseHp": 500, "baseAttack": 35, "baseDefense": 30, "baseExp": 300, "gold": 180, "desc": "巨大な石の守護者。"}, "wyvern": {"name": "ワイバーン", "baseHp": 700, "baseAttack": 45, "baseDefense": 24, "baseExp": 450, "gold": 300, "desc": "空を舞う竜種。"}, "demon": {"name": "上級悪魔", "baseHp": 900, "baseAttack": 60, "baseDefense": 40, "baseExp": 700, "gold": 500, "desc": "強大な魔力を持つ悪魔。"}, "dragon": {"name": "炎竜", "baseHp": 1500, "baseAttack": 80, "baseDefense": 55, "baseExp": 1500, "gold": 1200, "desc": "炎を操る巨大な竜。"}, "lich": {"name": "リッチ", "baseHp": 2200, "baseAttack": 110, "baseDefense": 70, "baseExp": 2500, "gold": 2500, "desc": "死を超越した魔術師。"}, "kraken": {"name": "クラーケン", "baseHp": 3500, "baseAttack": 150, "baseDefense": 90, "baseExp": 4500, "gold": 5000, "desc": "海を支配する怪物。"}, "void_beast": {"name": "虚無獣", "baseHp": 6000, "baseAttack": 220, "baseDefense": 130, "baseExp": 9000, "gold": 10000, "desc": "世界の外側から来た怪物。"}};

const COMMANDS=[
["/char_create",["/c"],"キャラクター作成","/char_create 名前"],
["/char_list",["/cl"],"キャラクター一覧","/char_list"],
["/char_show",["/cs"],"現在のキャラクター","/char_show"],
["/char_use",["/cu"],"キャラクター使用","/char_use 名前 または番号"],
["/char_delete",["/cd"],"キャラクター削除","/char_delete 名前 または番号"],
["/char_reset",["/cr"],"キャラクターリロール","/char_reset"],
["/status",["/st"],"ステータス表示","/status"],
["/status_reroll",["/reroll"],"ステータス振りなおし","/status_reroll"],
["/status_up",["/su"],"ステータスを1つ+1","/status_up STR|DEX|INT|POW"],
["/item_list",["/il"],"アイテム一覧・番号確認","/item_list"],
["/item_use",["/iu"],"アイテム使用","/item_use potion|ether"],
["/equip",["/eq"],"アイテム一覧の番号で装備","/equip weapon|armor 番号"],
["/enemy_list",["/el"],"敵ID一覧","/enemy_list"],
["/enemy_info",["/ei"],"敵情報","/enemy_info 敵ID レベル"],
["/battle_start",["/b"],"戦闘開始","/battle_start 敵ID レベル"],
["/battle_status",["/bs"],"戦闘状態","/battle_status"],
["/battle_attack",["/a"],"通常攻撃","/battle_attack"],
["/magic_cast",["/m"],"魔法攻撃","/magic_cast 魔法名"],
["/battle_run",["/run"],"逃走","/battle_run"],
["/pvp_start",["/pvp"],"2人PvP開始","/pvp_start プレイヤー1 プレイヤー2"],
["/pvp_attack",["/pa"],"PvP通常攻撃","/pvp_attack"],
["/pvp_magic",["/pm"],"PvP魔法","/pvp_magic 魔法名"],
["/pvp_status",["/ps"],"PvP状態","/pvp_status"],
["/pvp_end",["/pe"],"PvP終了","/pvp_end"],
["/save",[],"保存","/save"],
["/load",[],"読み込み","/load"],
["/help",["/h","/?"],"ヘルプ","/help"],
["/clear",[],"ログ消去","/clear"]
];

function fresh(){return{
 character:null,characters:[],battle:null,pvp:null,
 inventory:{potion:3,ether:2,items:[]},
 equipment:{weapon:null,armor:null},
 gold:0,history:[]
}}
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY));return x?{...fresh(),...x}:fresh()}catch(e){return fresh()}}
let save=load();

const $=s=>document.querySelector(s);
function log(msg,type="system"){const e=document.createElement("div");e.className="line "+type;e.textContent=msg;$("#output").appendChild(e);$("#output").scrollTop=$("#output").scrollHeight}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(save))}catch(e){}render()}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function usage(c,msg="入力方法が正しくありません。"){const x=COMMANDS.find(a=>a[0]===c);log((msg?msg+"\n":"")+`正しい入力方法: ${x?x[3]:c}`,"error")}
function render(){const c=save.character;$("#status").textContent=c?`${c.name} Lv.${c.level} EXP ${c.exp}/${c.nextExp}　HP ${c.hp}/${c.maxHp}　MP ${c.mp}/${c.maxMp}　STR ${c.str}　DEX ${c.dex}　INT ${c.int}　POW ${c.pow}　Gold ${save.gold}`:"キャラクター未作成"}

function makeChar(name){return{id:String(Date.now()+Math.random()),name,level:1,exp:0,nextExp:100,hp:100,maxHp:100,mp:50,maxMp:50,str:10,dex:10,int:10,pow:10,skills:[]}}
function create(name){if(!name)return usage("/char_create");const c=makeChar(name);save.character=c;save.characters=[...save.characters.filter(x=>x.name!==name),c];persist();log(`${name} を作成しました。`,"success")}
function listChars(){log(save.characters.length?save.characters.map((c,i)=>`${i+1}. ${c.name} Lv.${c.level} EXP ${c.exp}/${c.nextExp}`).join("\n"):"キャラクターはいません。")}
function show(){if(!save.character)return usage("/char_create","キャラクターがありません。");const c=save.character;log(`${c.name} Lv.${c.level}\nEXP ${c.exp}/${c.nextExp}\nHP ${c.hp}/${c.maxHp}\nMP ${c.mp}/${c.maxMp}\nSTR ${c.str} DEX ${c.dex} INT ${c.int} POW ${c.pow}\n所持金: ${save.gold}\nアイテム: 回復薬 ${save.inventory.potion} / 魔力薬 ${save.inventory.ether}\n武器: ${save.equipment?.weapon?`★${save.equipment.weapon.stars} ${save.equipment.weapon.name} 攻撃+${save.equipment.weapon.bonus}`:"なし"}\n防具: ${save.equipment?.armor?`★${save.equipment.armor.stars} ${save.equipment.armor.name} 防御+${save.equipment.armor.bonus}`:"なし"}`)}
function useChar(x){if(!x)return usage("/char_use");const c=save.characters.find(a=>a.name===x)||save.characters[Number(x)-1];if(!c)return log("キャラクターが見つかりません。","error");save.character=c;persist();log(`${c.name} を使用中にしました。`,"success")}
function deleteChar(x){if(!x)return usage("/char_delete");let i=Number.isNaN(Number(x))?-1:Number(x)-1;if(i<0)i=save.characters.findIndex(c=>c.name===x);if(i<0||!save.characters[i])return log("キャラクターが見つかりません。","error");const d=save.characters.splice(i,1)[0];if(save.character?.id===d.id)save.character=save.characters[0]||null;persist();log(`${d.name} を削除しました。`,"success")}
function reset(){if(!save.character)return usage("/char_reset","リロールするキャラクターがありません。");const c=save.character;c.level=1;c.exp=0;c.nextExp=100;c.hp=100;c.maxHp=100;c.mp=50;c.maxMp=50;c.str=10;c.dex=10;c.int=10;c.pow=10;c.skills=[];save.characters=save.characters.map(x=>x.id===c.id?c:x);persist();log(`${c.name} をリロールしました。`,"success")}
function status(){show();log("Goldショップ: /status_reroll（スライム10体分） /status_up STR|DEX|INT|POW（スライム20体分）","warn")}

function statusReroll(){
 if(!save.character)return usage("/status_reroll","先にキャラクターを作成してください。");
 const c=save.character;
 const cost=ENEMIES.slime.baseExp*10; // スライム10体分 = 100 Gold
 if(save.gold<cost)return log(`Goldが足りません。必要: ${cost} Gold（スライム10体分）`,"error");
 save.gold-=cost;
 c.str=rand(10,20);c.dex=rand(10,20);c.int=rand(10,20);c.pow=rand(10,20);
 save.characters=save.characters.map(x=>x.id===c.id?c:x);
 persist();
 log(`💰 ${cost} Goldを使用してステータスを振りなおしました！\nSTR ${c.str} / DEX ${c.dex} / INT ${c.int} / POW ${c.pow}`,"success");
}
function statusUp(stat){
 if(!save.character)return usage("/status_up","先にキャラクターを作成してください。");
 const key=String(stat||"").toLowerCase();
 const map={str:"str",dex:"dex",int:"int",pow:"pow"};
 const jp={str:"STR",dex:"DEX",int:"INT",pow:"POW"};
 const k=map[key]||map[{"筋力":"str","敏捷":"dex","知力":"int","精神":"pow"}[key]];
 if(!k)return usage("/status_up");
 const cost=ENEMIES.slime.baseExp*20; // スライム20体分 = 200 Gold
 if(save.gold<cost)return log(`Goldが足りません。必要: ${cost} Gold（スライム20体分）`,"error");
 save.gold-=cost;
 save.character[k]+=1;
 save.characters=save.characters.map(x=>x.id===save.character.id?save.character:x);
 persist();
 log(`💰 ${cost} Goldを使用して${jp[k]}を+1しました！`,"success");
}

const WEAPON_NAMES_BY_STAR={
 1:["鉄の剣","旅人の短剣","粗末な槍"],
 2:["鋼鉄の剣","狩人の弓","兵士の槍"],
 3:["騎士の剣","月影の刃","紅蓮の大剣"],
 4:["魔銀の剣","雷鳴槍","白銀の弓"],
 5:["黒曜の斧","竜牙の槍","天翔の双剣"],
 6:["深淵の鎌","聖騎士の剣","冥王の大鎌"],
 7:["神域の杖","星輝の剣","古竜の大剣"],
 8:["天界の弓","虚空の杖","世界樹の槍"],
 9:["終焉の魔剣","神殺しの剣","混沌の鎌"],
 10:["創世の剣","万象を断つ聖剣","神話級・天命の剣"]
};
const ARMOR_NAMES_BY_STAR={
 1:["布の鎧","旅人の革鎧","粗末な胸当て"],
 2:["鉄の鎧","鋼鉄の胸当て","守護の鎧"],
 3:["騎士の鎧","月影のローブ","紅蓮の胸当て"],
 4:["魔銀の鎧","雷鳴の甲冑","白銀の軽鎧"],
 5:["黒曜の重装","竜鱗の鎧","天翔の羽衣"],
 6:["深淵の外套","聖騎士の鎧","冥王の甲冑"],
 7:["神域の法衣","星輝の鎧","古竜の鎧"],
 8:["天界の鎧","虚空の法衣","世界樹の鎧"],
 9:["終焉の鎧","神殺しの甲冑","混沌の外套"],
 10:["創世の鎧","万象を統べる鎧","神話級・天命の鎧"]
};

function itemList(){
 const inv=save.inventory||{potion:0,ether:0,items:[]};
 const eq=save.equipment||{weapon:null,armor:null};
 let lines=[`回復薬 ×${inv.potion||0}（戦闘中: HPが50回復）`,`魔力薬 ×${inv.ether||0}（戦闘中: MPが30回復）`];
 if(inv.items?.length) lines.push("装備品:",...inv.items.map((x,i)=>`${i+1}. ${x.type==="weapon"?"武器":"防具"} ★${x.stars} ${x.name} ${x.type==="weapon"?"攻撃+"+x.bonus:"防御+"+x.bonus}`));
 else lines.push("装備品: なし");
 lines.push(`現在の武器: ${eq.weapon?`★${eq.weapon.stars} ${eq.weapon.name}（攻撃+${eq.weapon.bonus}）`:"なし"}`);
 lines.push(`現在の防具: ${eq.armor?`★${eq.armor.stars} ${eq.armor.name}（防御+${eq.armor.bonus}）`:"なし"}`);
 log(lines.join("\n"));
}

function useItem(name){
 if(!save.battle)return usage("/item_use","アイテムは戦闘中のみ使えます。");
 const c=save.character, key=String(name||"").toLowerCase();
 if(key==="potion"||key==="回復薬"){
  if(save.inventory.potion<=0)return log("回復薬を持っていません。","error");
  if(c.hp>=c.maxHp)return log("HPが満タンです。","warn");
  save.inventory.potion--;c.hp=Math.min(c.maxHp,c.hp+50);persist();log("回復薬を使った！ HPが50回復。","success");enemyTurn();
 } else if(key==="ether"||key==="魔力薬"){
  if(save.inventory.ether<=0)return log("魔力薬を持っていません。","error");
  if(c.mp>=c.maxMp)return log("MPが満タンです。","warn");
  save.inventory.ether--;c.mp=Math.min(c.maxMp,c.mp+30);persist();log("魔力薬を使った！ MPが30回復。","success");enemyTurn();
 } else usage("/item_use");
}

function enemyTurn(){
 if(!save.battle)return;
 const e=save.battle.enemy,c=save.character;
 const ed=rand(Math.max(1,e.attack-5),e.attack);
 c.hp=Math.max(0,c.hp-ed);
 log(`${e.name}の攻撃！ ${ed}ダメージ。`);
 if(c.hp<=0){log("あなたは倒れた……","error");finishBattle(false);return}
 persist();battleStatus();
}

function autoItem(){
 if(!save.battle)return false;
 const c=save.character;
 if(c.hp>0 && c.hp/c.maxHp<=0.25 && save.inventory.potion>0 && c.hp<c.maxHp){
  save.inventory.potion--;
  c.hp=Math.min(c.maxHp,c.hp+50);
  log("⚡ HPが25%以下になったため、回復薬を自動使用！ HPが50回復。","success");
  return true;
 }
 if(c.mp>0 && c.mp/c.maxMp<=0.15 && save.inventory.ether>0 && c.mp<c.maxMp){
  save.inventory.ether--;
  c.mp=Math.min(c.maxMp,c.mp+30);
  log("⚡ MPが15%以下になったため、魔力薬を自動使用！ MPが30回復。","success");
  return true;
 }
 return false;
}

function rollRareEquipment(enemy){
 const chance=Math.min(0.35,0.08+enemy.level*0.005);
 if(Math.random()>chance)return null;
 const type=Math.random()<0.5?"weapon":"armor";
 const stars=rand(1,10);
 const names=type==="weapon"?WEAPON_NAMES_BY_STAR[stars]:ARMOR_NAMES_BY_STAR[stars];
 const name=names[rand(0,names.length-1)];
 const item={id:String(Date.now()+Math.random()),type,stars,name,bonus:type==="weapon"?10:stars*2};
 save.inventory.items.push(item);
 log(`✨ レアアイテムドロップ！ ${type==="weapon"?"武器":"防具"} ★${stars} ${name}（${type==="weapon"?"攻撃":"防御"}+${item.bonus}）`,"success");
 return item;
}

function equipItem(index){
 const i=Number(index)-1;
 const item=save.inventory.items?.[i];
 if(!item)return usage("/equip","その番号のアイテムがありません。まず /item_list で番号を確認してください。");
 save.equipment=save.equipment||{weapon:null,armor:null};
 save.equipment[item.type]=item;
 persist();
 log(`${item.name} ★${item.stars} を装備しました。`,"success");
}

function enemyStats(id,lv){const b=ENEMIES[id];const level=Math.max(1,Number(lv)||1);const mult=1+(level-1)*0.18;return{...b,level,maxHp:Math.floor(b.baseHp*mult),hp:Math.floor(b.baseHp*mult),attack:Math.floor(b.baseAttack*(1+(level-1)*0.12)),defense:Math.floor(b.baseDefense*(1+(level-1)*0.1)),exp:Math.floor(b.baseExp*(1+(level-1)*0.2)),gold:Math.floor(b.gold*(1+(level-1)*0.15))}}
function enemyList(){log(Object.keys(ENEMIES).map(id=>`${id} → ${ENEMIES[id].name} (基礎HP ${ENEMIES[id].baseHp})`).join("\n"))}
function enemyInfo(id,lv){if(!id)return usage("/enemy_info");if(!ENEMIES[id])return log(`敵ID「${id}」がありません。\n/enemy_list で確認してください。`,"error");const e=enemyStats(id,lv||1);log(`${e.name} Lv.${e.level}\nHP ${e.hp}\n攻撃 ${e.attack}\n防御 ${e.defense}\n獲得EXP ${e.exp}\n獲得Gold ${e.gold}\n${e.desc}`)}

function battleStart(id,lv){if(!id)return usage("/battle_start");if(!ENEMIES[id])return log(`敵ID「${id}」がありません。\n/enemy_list で確認してください。`,"error");if(!save.character)return usage("/char_create","先にキャラクターを作成してください。");const e=enemyStats(id,lv||1);save.battle={enemy:e,returnState:{hp:save.character.hp,mp:save.character.mp}};persist();log(`⚔ ${e.name} Lv.${e.level} が現れた！\nHP ${e.hp} / 攻撃 ${e.attack} / 防御 ${e.defense}`);battleStatus()}
function battleStatus(){if(!save.battle)return usage("/battle_start","戦闘中ではありません。");const e=save.battle.enemy,c=save.character;log(`敵: ${e.name} Lv.${e.level} HP ${e.hp}/${e.maxHp}\nあなた: ${c.name} HP ${c.hp}/${c.maxHp} MP ${c.mp}/${c.maxMp}`)}
function gainExp(n){const c=save.character;c.exp+=n;log(`EXP +${n} (${c.exp}/${c.nextExp})`);while(c.exp>=c.nextExp){c.exp-=c.nextExp;c.level++;c.nextExp=Math.floor(c.nextExp*1.35);c.maxHp+=20;c.hp=c.maxHp;c.maxMp+=10;c.mp=c.maxMp;c.str+=2;c.dex+=2;c.int+=2;c.pow+=2;log(`🎉 LEVEL UP! ${c.name} は Lv.${c.level} になった！\nステータスが上昇した！`,"success")}}
function finishBattle(win){
    const b = save.battle;
    const c = save.character;

    if(win){
        gainExp(b.enemy.exp);
        save.gold += b.enemy.gold;

        log(`💰 Gold +${b.enemy.gold}`,"success");
    }

    /*
     * 戦闘終了時にHPとMPを最大値まで回復
     */
    c.hp = c.maxHp;
    c.mp = c.maxMp;

    save.battle = null;

    persist();

    log("戦闘終了。HPとMPが最大値まで回復しました。");
}
function attack(){if(!save.battle)return usage("/battle_start","戦闘中ではありません。");const e=save.battle.enemy,c=save.character;autoItem(); const weaponBonus=save.equipment?.weapon?.bonus||0; const d=Math.max(1,rand(8,18)+c.str+weaponBonus-Math.floor(e.defense*.35));e.hp-=d;log(`${c.name}の攻撃！ ${d}ダメージ。`);if(e.hp<=0){log(`${e.name}を倒した！`,"success");rollRareEquipment(e);return finishBattle(true)}const armorBonus=save.equipment?.armor?.bonus||0; const ed=Math.max(0,rand(Math.max(1,e.attack-5),e.attack)-armorBonus);c.hp=Math.max(0,c.hp-ed);log(`${e.name}の攻撃！ ${ed}ダメージ。`);if(c.hp<=0){log("あなたは倒れた……","error");return finishBattle(false)}persist();battleStatus()}
function magic(name){if(!name)return usage("/magic_cast");if(!save.battle)return usage("/battle_start","戦闘中ではありません。");const c=save.character,e=save.battle.enemy;if(c.mp<10)return log("MPが足りません。","error");c.mp-=10;const d=Math.max(1,rand(20,35)+c.int-Math.floor(e.defense*.15));e.hp-=d;log(`${name}！ ${d}ダメージ。`);if(e.hp<=0){log(`${e.name}を倒した！`,"success");rollRareEquipment(e);return finishBattle(true)}const armorBonus=save.equipment?.armor?.bonus||0; const ed=Math.max(0,rand(Math.max(1,e.attack-5),e.attack)-armorBonus);c.hp=Math.max(0,c.hp-ed);if(c.hp<=0)return finishBattle(false);persist();battleStatus()}
function run(){if(!save.battle)return usage("/battle_start","戦闘中ではありません。");if(Math.random()<.65){log("逃走に成功した！");finishBattle(false)}else{log("逃走に失敗した！","warn");const e=save.battle.enemy,c=save.character;c.hp=Math.max(0,c.hp-rand(1,e.attack));persist();battleStatus()}}

function pvpStart(a,b){if(!a||!b)return usage("/pvp_start");save.pvp={turn:1,current:0,players:[{name:a,hp:100,maxHp:100,mp:50,str:10,int:10},{name:b,hp:100,maxHp:100,mp:50,str:10,int:10}]};persist();log(`⚔ ${a} vs ${b} 開始！`);pvpStatus()}
function pvpStatus(){if(!save.pvp)return usage("/pvp_start","PvP中ではありません。");const a=save.pvp.players[0],b=save.pvp.players[1],c=save.pvp.players[save.pvp.current];log(`Turn ${save.pvp.turn}\n${a.name}: HP ${a.hp} MP ${a.mp}\n${b.name}: HP ${b.hp} MP ${b.mp}\n現在: ${c.name}`)}
function pvpNext(){save.pvp.current=1-save.pvp.current;if(save.pvp.current===0)save.pvp.turn++;persist();pvpStatus()}
function pvpAttack(){if(!save.pvp)return usage("/pvp_start","PvP中ではありません。");const p=save.pvp.players[save.pvp.current],t=save.pvp.players[1-save.pvp.current],d=rand(8,18)+p.str;t.hp-=d;log(`${p.name} → ${t.name}: ${d}ダメージ`);if(t.hp<=0){log(`${p.name} の勝利！`,"success");save.pvp=null;persist();return}pvpNext()}
function pvpMagic(n){if(!n)return usage("/pvp_magic");if(!save.pvp)return usage("/pvp_start","PvP中ではありません。");const p=save.pvp.players[save.pvp.current],t=save.pvp.players[1-save.pvp.current];if(p.mp<10)return log("MPが足りません。","error");p.mp-=10;const d=rand(18,35)+p.int;t.hp-=d;log(`${p.name}の${n} → ${t.name}: ${d}ダメージ`);if(t.hp<=0){log(`${p.name} の勝利！`,"success");save.pvp=null;persist();return}pvpNext()}

function help(){
 log(
  "【キャラクター】\\n"+
  COMMANDS.filter(c=>["/char_create","/char_list","/char_show","/char_use","/char_delete","/char_reset","/status","/status_reroll","/status_up"].includes(c[0])).map(c=>`${c[0]} ${c[2]} | ${c[3]}`).join("\\n")+
  "\\n\\n【アイテム・装備】\\n"+
  "/item_list アイテム一覧を表示。表示された番号で装備できます。\\n"+
  "/equip weapon 番号 武器を装備（例: /equip weapon 1）\\n"+
  "/equip armor 番号 防具を装備（例: /equip armor 2）\\n"+
  "/item_use potion|ether 戦闘中にアイテム使用\\n"+
  "\\n【敵・戦闘】\\n"+
  COMMANDS.filter(c=>["/enemy_list","/enemy_info","/battle_start","/battle_status","/battle_attack","/magic_cast","/battle_run"].includes(c[0])).map(c=>`${c[0]} ${c[2]} | ${c[3]}`).join("\\n")+
  "\\n\\n【PvP】\\n"+
  COMMANDS.filter(c=>c[0].startsWith("/pvp_")).map(c=>`${c[0]} ${c[2]} | ${c[3]}`).join("\\n")+
  "\\n\\n【その他】\\n"+
  COMMANDS.filter(c=>["/save","/load","/clear"].includes(c[0])).map(c=>`${c[0]} ${c[2]} | ${c[3]}`).join("\\n")
 )
}
function execute(raw){const p=raw.trim().split(/\s+/),input=p.shift()?.toLowerCase();if(!input)return;log("> "+raw,"user");const c=COMMANDS.find(x=>x[0]===input||x[1].includes(input)),cmd=c?.[0]||input;switch(cmd){
case"/char_create":return create(p.join(" "));case"/char_list":return listChars();case"/char_show":return show();case"/char_use":return useChar(p.join(" "));case"/char_delete":return deleteChar(p.join(" "));case"/char_reset":return reset();case"/status":return status();case"/status_reroll":return statusReroll();case"/status_up":return statusUp(p[0]);case"/item_list":return itemList();case"/item_use":return useItem(p[0]);case"/equip":return equipItem(p[1]||p[0]);case"/enemy_list":return enemyList();case"/enemy_info":return enemyInfo(p[0],p[1]);case"/battle_start":return battleStart(p[0],p[1]);case"/battle_status":return battleStatus();case"/battle_attack":return attack();case"/magic_cast":return magic(p.join(" "));case"/battle_run":return run();case"/pvp_start":return pvpStart(p[0],p.slice(1).join(" "));case"/pvp_attack":return pvpAttack();case"/pvp_magic":return pvpMagic(p.join(" "));case"/pvp_status":return pvpStatus();case"/pvp_end":if(!save.pvp)return usage("/pvp_start","PvP中ではありません。");save.pvp=null;persist();return log("PvPを終了しました。");case"/save":persist();return log("保存しました。","success");case"/load":save=load();render();return log("読み込みました。","success");case"/clear":$("#output").innerHTML="";return;case"/help":return help();default:return log(`不明なコマンド: ${input}\n/help で一覧を表示できます。`,"error")}}

let selected=0;
function update(){const v=$("#command-input").value.trim().toLowerCase(),box=$("#suggestions");if(!v.startsWith("/")){box.classList.add("hidden");return}const m=COMMANDS.filter(c=>c[0].startsWith(v)||c[1].some(a=>a.startsWith(v)));if(!m.length){box.classList.add("hidden");return}selected=Math.min(selected,m.length-1);box.innerHTML=m.map((c,i)=>`<div class="suggestion ${i===selected?"selected":""}" data-c="${c[0]}"><b>${c[0]}</b> ${c[2]}</div>`).join("");box.classList.remove("hidden");box.querySelectorAll(".suggestion").forEach(x=>x.addEventListener("mousedown",e=>{e.preventDefault();$("#command-input").value=x.dataset.c+" ";$("#command-input").focus();update()}))}
$("#command-input").addEventListener("input",()=>{selected=0;update()});
$("#command-input").addEventListener("keydown",e=>{const v=e.currentTarget.value.trim().toLowerCase(),m=COMMANDS.filter(c=>c[0].startsWith(v)||c[1].some(a=>a.startsWith(v)));if(e.key==="ArrowDown"&&m.length){e.preventDefault();selected=(selected+1)%m.length;update()}if(e.key==="ArrowUp"&&m.length){e.preventDefault();selected=(selected-1+m.length)%m.length;update()}if(e.key==="Tab"&&m.length){e.preventDefault();e.currentTarget.value=m[selected][0]+" ";update()}if(e.key==="Escape")$("#suggestions").classList.add("hidden")});
$("#command-form").addEventListener("submit",e=>{e.preventDefault();const i=$("#command-input");execute(i.value);i.value="";$("#suggestions").classList.add("hidden")});
render();log("Ultimate版 起動完了。外部データ読み込みなし。/help でコマンド一覧。");if(save.character)log(`保存済みキャラクター「${save.character.name}」を読み込みました。`,"success");
})();
