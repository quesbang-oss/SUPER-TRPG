    (() => {
"use strict";

/* 完全スタンドアロン：fetch不使用。敵データは直接内蔵。 */
const STORAGE_KEY="border-trpg-ultimate-v2";
const STAT_MAX=999999999999;

const ENEMIES = {
  slime:{name:"スライム",baseHp:30,baseAttack:5,baseDefense:1,baseExp:10,gold:5,desc:"ぷるぷるした魔物。"},
  shadow:{name:"黒い影",baseHp:50,baseAttack:8,baseDefense:3,baseExp:25,gold:12,desc:"不気味な影。"},
  goblin:{name:"ゴブリン",baseHp:80,baseAttack:12,baseDefense:5,baseExp:40,gold:20,desc:"小さく素早い魔物。"},
  wolf:{name:"灰色狼",baseHp:100,baseAttack:16,baseDefense:6,baseExp:55,gold:30,desc:"群れで狩る獣。"},
  orc:{name:"オーク",baseHp:180,baseAttack:22,baseDefense:12,baseExp:90,gold:55,desc:"強靭な肉体を持つ魔物。"},
  skeleton:{name:"スケルトン",baseHp:120,baseAttack:18,baseDefense:8,baseExp:70,gold:40,desc:"骨だけの戦士。"},
  vampire:{name:"ヴァンパイア",baseHp:260,baseAttack:30,baseDefense:15,baseExp:160,gold:100,desc:"血を吸う夜の怪物。"},
  golem:{name:"ストーンゴーレム",baseHp:500,baseAttack:35,baseDefense:30,baseExp:300,gold:180,desc:"巨大な石の守護者。"},
  wyvern:{name:"ワイバーン",baseHp:700,baseAttack:45,baseDefense:24,baseExp:450,gold:300,desc:"空を舞う竜種。"},
  demon:{name:"上級悪魔",baseHp:900,baseAttack:60,baseDefense:40,baseExp:700,gold:500,desc:"強大な魔力を持つ悪魔。"},
  dragon:{name:"炎竜",baseHp:1500,baseAttack:80,baseDefense:55,baseExp:1500,gold:1200,desc:"炎を操る巨大な竜。"},
  lich:{name:"リッチ",baseHp:2200,baseAttack:110,baseDefense:70,baseExp:2500,gold:2500,desc:"死を超越した魔術師。"},
  kraken:{name:"クラーケン",baseHp:3500,baseAttack:150,baseDefense:90,baseExp:4500,gold:5000,desc:"海を支配する怪物。"},
  void_beast:{name:"虚無獣",baseHp:6000,baseAttack:220,baseDefense:130,baseExp:9000,gold:10000,desc:"世界の外側から来た怪物。"},
  kishi:{name:"方向の騎士",baseHp:10000,baseAttack:99999999,baseDefense:1000,baseExp:15000,gold:15000,desc:"こいつはどこから来たのだろうか．．．"},
  funny:{name:"大草原不可避",baseHp:100,baseAttack:1000,baseDefense:1000000,baseExp:15000,gold:15000,desc:"こいつはたぶん...ネットから来たな"},
  cat:{
  name:"ルナティック猫",
  baseHp:100000000,
  baseAttack:10000,
  baseDefense:100000,
  baseExp:1000000,
  gold:1000000,

  desc:"狂気に満ちた猫。英数名：cat",

  // 行動順
  // 1 = 通常攻撃
  // 2 = 猫パンチ・極
  actions:[1,2,1],

  // 必殺技
  skills:{
    2:{
      name:"猫パンチ・極",
      damageRate:3
    }
  },

  guaranteedDrop:{
    name:"髪の毛一本",
    type:"weapon",
    stars:4,
    bonus:100
  }
}
　
};

/* =========================================
   ボス・裏ボス
========================================= */
const BOSS_DATA={
  boss_01:{name:"紅蓮の覇王ヴァルガス",rank:1,hp:90000,attack:200,defense:30,rewardLevel:1},
  boss_02:{name:"深海王アビサル",rank:2,hp:110000,attack:200,defense:30,rewardLevel:2},
  boss_03:{name:"天空要塞ゼファリオン",rank:3,hp:150000,attack:250,defense:30,rewardLevel:3},
  boss_04:{name:"冥界公爵ネクロヴァ",rank:4,hp:200000,attack:300,defense:30,rewardLevel:4},
  boss_05:{name:"星喰らいグラビオン",rank:5,hp:300000,attack:350,defense:30,rewardLevel:5},
  boss_06:{name:"時空皇帝クロノゼロ",rank:6,hp:500000,attack:400,defense:30,rewardLevel:6},
  boss_07:{name:"終焉騎士アポカリプス",rank:7,hp:650000,attack:500,defense:30,rewardLevel:7},
  boss_08:{name:"混沌神カオス・レギオン",rank:8,hp:800000,attack:600,defense:30,rewardLevel:8},
  boss_09:{name:"万象破壊獣オメガ",rank:9,hp:999999,attack:900,defense:30,rewardLevel:9},
  boss_10:{name:"世界断絶神エンド・オブ・ワールド",rank:10,hp:1000000,attack:1000,defense:30,rewardLevel:10},
  sunshine_izake:{name:"サンシャインイ・ザーキ",hp:1500000,attack:1200,defense:30,goldReward:150000,secret:"shine"},
  moon_senbei:{name:"月せんべい",hp:1000000,attack:1000,defense:30,goldReward:1000000,secret:"がっちがちやで"},
  evolving_void_beast:{name:"進化する虚無獣",hp:500000,attack:1200,defense:30,goldReward:500000,evolving:true}
};

const COMMANDS=[
  ["/char_create",["/c"],"キャラクター作成","/char_create 名前"],
  ["/char_list",["/cl"],"キャラクター一覧","/char_list"],
  ["/char_show",["/cs"],"現在のキャラクター","/char_show"],
  ["/char_use",["/cu"],"キャラクター使用","/char_use 名前 または番号"],
  ["/char_delete",["/cd"],"キャラクター削除","/char_delete 名前 または番号"],
  ["/char_reset",["/cr"],"キャラクターリロール","/char_reset"],
  ["/status",["/st"],"ステータス表示","/status"],
  ["/status_reroll",["/reroll"],"ステータス振りなおし","/status_reroll"],
  ["/status_up",["/su"],"ステータスを+1（後ろに数を付けると一括）","/status_up STR [数]"],
  ["/item_list",["/il"],"アイテム一覧・番号確認","/item_list"],
  ["/item_use",["/iu"],"アイテム使用","/item_use potion|ether|番号"],
  ["/equip",["/eq"],"アイテム一覧の番号で装備","/equip weapon|armor 番号"],
["/synthesize",["/syn"],"装備合成","/synthesize 番号 番号 番号"],
  ["/enemy_list",["/el"],"敵ID一覧","/enemy_list"],
  ["/enemy_info",["/ei"],"敵情報","/enemy_info 敵ID レベル"],
  ["/battle_start",["/b"],"戦闘開始","/battle_start 敵ID レベル"],
  ["/battle_status",["/bs"],"戦闘状態","/battle_status"],
  ["/battle_attack",["/a"],"通常攻撃","/battle_attack"],
  ["/magic_cast",["/m"],"魔法攻撃・必殺技","/magic_cast 魔法名"],
  ["/battle_run",["/run"],"逃走","/battle_run"],
  ["/pvp_start",["/pvp"],"2人PvP開始","/pvp_start プレイヤー1 プレイヤー2"],
  ["/pvp_attack",["/pa"],"PvP通常攻撃","/pvp_attack"],
  ["/pvp_magic",["/pm"],"PvP魔法・必殺技","/pvp_magic 魔法名"],
  ["/pvp_status",["/ps"],"PvP状態","/pvp_status"],
  ["/pvp_end",["/pe"],"PvP終了","/pvp_end"],

  ["/online_create",["/oc"],"オンラインPvPルーム作成","/online_create"],
  ["/online_join",["/oj"],"オンラインPvP参加","/online_join ルームコード"],
  ["/online_status",["/os"],"オンラインPvP状態","/online_status"],
  ["/online_attack",["/oa"],"オンラインPvP攻撃","/online_attack"],
  ["/online_magic",["/om"],"オンラインPvP魔法","/online_magic 魔法名"],
  ["/online_end",["/oe"],"オンラインPvP終了","/online_end"],

  ["/save",[],"保存","/save"],
  ["/load",[],"読み込み","/load"],
  ["/help",["/h","/?"],"ヘルプ","/help"],
  ["/clear",[],"ログ消去","/clear"]
];

const EQUIPMENT_SPECIALS={
  1:"ブレイクスラッシュ",
  2:"ツインエッジ",
  3:"フレイムバースト",
  4:"ブリザードエッジ",
  5:"サンダーブレイカー",
  6:"ダークネスブレード",
  7:"テンペストスラッシュ",
  8:"メテオクラッシュ",
  9:"ディメンションブレイク",
  10:"ラグナロク"
};
/* =========================================
   SECRETレアリティ設定
   ここを追加するだけでSecret装備を増やせる
========================================= */
const SECRET_EQUIPMENT={
  "dragon_soul":{
    name:"大魔神の予言書",
    type:"weapon",
    stars:"SECRET",
    bonus:100,
    maxLevel:Infinity,

    specialMagic:{
      name:"ゲプトラダムスの大間違い",
      damage:5,       // STR × 5
      mpCost:100,
      unlockLevel:5
    }
  },

  "bossgdora":{
    name:"超弩級破壊兵器ボスゴドーラ",
    type:"armor",
    stars:"SECRET",
    bonus:400,
    maxLevel:Infinity,

    specialMagic:{
      name:"ぐぅおぉぉぉぉぉ",
      damage:100,     // STR × 100
      mpCost:9999999,
      unlockLevel:5
    }
  },

  "world_end":{
    name:"スーパーチュールブレイカー",
    type:"weapon",
    stars:"SECRET",
    bonus:222,
    maxLevel:Infinity,

    specialMagic:{
      name:"猫の大群",
      damage:4,       // STR × 4
      mpCost:50,
      unlockLevel:5
    }
  },

  "chemical_x":{
    name:"けぇみかるX",
    type:"armor",
    stars:"SECRET",
    bonus:30,
    maxLevel:Infinity,

    specialMagic:{
      name:"化学崩壊",
      damage:6,       // STR × 6
      mpCost:30,
      unlockLevel:5
    }
  },

  "fantastic":{
    name:"ファンタスティック",
    type:"weapon",
    stars:"SECRET",
    bonus:60,
    maxLevel:Infinity,

    specialMagic:{
      name:"ファンタスティック・バースト",
      damage:6,       // STR × 8
      mpCost:50,
      unlockLevel:5
    }
  },

  "mister_sword":{
    name:"ミスターソード",
    type:"weapon",
    stars:"SECRET",
    bonus:100,
    maxLevel:Infinity,

    specialMagic:{
      name:"ミスター・スラッシュ",
      damage:4,       // STR × 4
      mpCost:80,
      unlockLevel:5
    }
  },

  "bold_titan":{
    name:"大胆なタイタン",
    type:"armor",
    stars:"SECRET",
    bonus:150,
    maxLevel:Infinity,

    specialMagic:{
      name:"大胆な反撃",
      damage:10,      // STR × 10
      mpCost:100,
      unlockLevel:5
    }
  },

  "confiscation":{
    name:"コンフィスケイション",
    type:"weapon",
    stars:"SECRET",
    bonus:250,
    maxLevel:Infinity,

    specialMagic:{
      name:"完全没収",
      damage:6,      // STR × 12
      mpCost:150,
      unlockLevel:5
    }
  }
};



/* =========================================
   レアリティ合成設定
========================================= */

const RARITY_ORDER=[
  1,2,3,4,5,6,7,8,9,10
];

const SYNTHESIS_COUNT=3;

// ★5以上を合成したときのSecret確率
const SECRET_SYNTHESIS_CHANCE=0.10;
function fresh(){
  return {
    character:null,
    characters:[],
    battle:null,
    pvp:null,
    inventory:{potion:3,ether:2,items:[]},
    equipment:{weapon:null,armor:null},
    gold:0,
    history:[]
  };
}

function normalizeItem(item){

  if(!item)return null;

  // Secret装備
  if(item.rarity==="SECRET"){

    item.rarity="SECRET";
    item.stars="SECRET";

    item.killCount=Number(item.killCount)||0;
    item.level=Math.floor(item.killCount/10);

    item.bonus=Number(item.bonus)||0;
    item.bonusExtra=Number(item.bonusExtra)||0;

    return item;
  }

  // 通常装備
  item.rarity=item.rarity||"NORMAL";

  item.killCount=Number(item.killCount)||0;

  item.stars=Math.max(
    1,
    Math.min(10,Number(item.stars)||1)
  );

  item.level=Math.min(
    5,
    Math.floor(item.killCount/10)
  );
  item.bonusExtra=Number(item.bonusExtra)||0;

  item.bonus=
    item.type==="weapon"
      ? item.stars*item.level
      : item.stars*item.level;

  return item;
}

function load(){
  try{
    const x=JSON.parse(localStorage.getItem(STORAGE_KEY));
    const s=x?{...fresh(),...x}:fresh();
    s.inventory=s.inventory||{potion:0,ether:0,items:[]};
    s.inventory.items=(s.inventory.items||[]).map(normalizeItem);
    s.equipment=s.equipment||{weapon:null,armor:null};
    s.equipment.weapon=normalizeItem(s.equipment.weapon);
    s.equipment.armor=normalizeItem(s.equipment.armor);
    for(const c of s.characters||[]){
      for(const k of ["str","dex","int","pow"]){
        c[k]=Math.min(STAT_MAX,Math.max(0,Number(c[k])||0));
      }
    }
    if(s.character){
      for(const k of ["str","dex","int","pow"]){
        s.character[k]=Math.min(STAT_MAX,Math.max(0,Number(s.character[k])||0));
      }
    }
    return s;
  }catch(e){
    return fresh();
  }
}

let save=load();

const $=s=>document.querySelector(s);

function log(msg, type = "system") {
  const output = document.getElementById("output");

  if (!output) {
    console.error("ログ表示欄 #output が見つかりません");
    return;
  }

  const e = document.createElement("div");
  e.className = "line " + type;

  e.textContent = String(msg)
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  e.style.whiteSpace = "pre-wrap";

  output.appendChild(e);
  output.scrollTop = output.scrollHeight;
}

function persist(){
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify(save));
  }catch(e){
    log("保存に失敗しました。ブラウザの保存設定を確認してください。","error");
  }
  render();
}

function rand(a,b){
  return Math.floor(Math.random()*(b-a+1))+a;
}

function usage(c,msg="入力方法が正しくありません。"){
  const x=COMMANDS.find(a=>a[0]===c);
  log((msg?msg+"\n":"")+`正しい入力方法: ${x?x[3]:c}`,"error");
}

function render(){
  const c=save.character;
  const w=save.equipment?.weapon;
  const a=save.equipment?.armor;
  $("#status").textContent=c
    ? `${c.name} Lv.${c.level} EXP ${c.exp}/${c.nextExp}　HP ${c.hp}/${c.maxHp}　MP ${c.mp}/${c.maxMp}　STR ${c.str}　DEX ${c.dex}　INT ${c.int}　POW ${c.pow}　Gold ${save.gold}`+
      `　武器Lv ${getEquipmentLevel(w)}/5　防具Lv ${getEquipmentLevel(a)}/5`
    : "キャラクター未作成";
}

function makeChar(name){
  return {
    id:String(Date.now()+Math.random()),
    name,
    level:1,
    exp:0,
    nextExp:100,
    hp:100,
    maxHp:100,
    mp:50,
    maxMp:50,
    str:10,
    dex:10,
    int:10,
    pow:10,
    skills:[]
  };
}

function create(name){
  if(!name)return usage("/char_create");
  const c=makeChar(name);
  save.character=c;
  save.characters=[...save.characters.filter(x=>x.name!==name),c];
  persist();
  log(`${name} を作成しました。`,"success");
}

function listChars(){
  log(
    save.characters.length
      ? save.characters.map((c,i)=>`${i+1}. ${c.name} Lv.${c.level} EXP ${c.exp}/${c.nextExp}`).join("\n")
      : "キャラクターはいません。"
  );
}

function show(){
  if(!save.character)return usage("/char_create","キャラクターがありません。");
  const c=save.character;
  const w=save.equipment?.weapon;
  const a=save.equipment?.armor;
  log(
`${c.name} Lv.${c.level}
EXP ${c.exp}/${c.nextExp}
HP ${c.hp}/${c.maxHp}
MP ${c.mp}/${c.maxMp}
STR ${c.str} DEX ${c.dex} INT ${c.int} POW ${c.pow}
所持金: ${save.gold}
アイテム: 回復薬 ${save.inventory.potion} / 魔力薬 ${save.inventory.ether}
武器: ${w?`★${w.stars} ${w.name} Lv.${getEquipmentLevel(w)}/5 攻撃+${getEquipmentBonus(w)} 必殺技: ${getSpecialName(w)||"未解放"}`:"なし"}
防具: ${a?`★${a.stars} ${a.name} Lv.${getEquipmentLevel(a)}/5 防御+${getEquipmentBonus(a)}`:"なし"}`
  );
}

function useChar(x){
  if(!x)return usage("/char_use");
  const c=save.characters.find(a=>a.name===x)||save.characters[Number(x)-1];
  if(!c)return log("キャラクターが見つかりません。","error");
  save.character=c;
  persist();
  log(`${c.name} を使用中にしました。`,"success");
}

function deleteChar(x){
  if(!x)return usage("/char_delete");
  let i=Number.isNaN(Number(x))?-1:Number(x)-1;
  if(i<0)i=save.characters.findIndex(c=>c.name===x);
  if(i<0||!save.characters[i])return log("キャラクターが見つかりません。","error");
  const d=save.characters.splice(i,1)[0];
  if(save.character?.id===d.id)save.character=save.characters[0]||null;
  persist();
  log(`${d.name} を削除しました。`,"success");
}

function reset(){
  if(!save.character)return usage("/char_reset","リロールするキャラクターがありません。");
  const c=save.character;
  c.level=1;c.exp=0;c.nextExp=100;
  c.hp=100;c.maxHp=100;c.mp=50;c.maxMp=50;
  c.str=10;c.dex=10;c.int=10;c.pow=10;c.skills=[];
  save.characters=save.characters.map(x=>x.id===c.id?c:x);
  persist();
  log(`${c.name} をリロールしました。`,"success");
}

function status(){
  show();
  log("Goldショップ: /status_reroll（スライム10体分） /status_up STR|DEX|INT|POW（スライム20体分）","warn");
}

function statusReroll(){
  if(!save.character)return usage("/status_reroll","先にキャラクターを作成してください。");
  const c=save.character;
  const cost=ENEMIES.slime.baseExp*10;
  if(save.gold<cost)return log(`Goldが足りません。必要: ${cost} Gold（スライム10体分）`,"error");
  save.gold-=cost;
  c.str=rand(10,20);c.dex=rand(10,20);c.int=rand(10,20);c.pow=rand(10,20);
  save.characters=save.characters.map(x=>x.id===c.id?c:x);
  persist();
  log(`💰 ${cost} Goldを使用してステータスを振りなおしました！\nSTR ${c.str} / DEX ${c.dex} / INT ${c.int} / POW ${c.pow}`,"success");
}

function statusUp(stat, amount=1){
  if(!save.character)return usage("/status_up","先にキャラクターを作成してください。");
  const key=String(stat||"").toLowerCase();
  const map={str:"str",dex:"dex",int:"int",pow:"pow"};
  const jp={str:"STR",dex:"DEX",int:"INT",pow:"POW"};
  const k=map[key]||map[{"筋力":"str","敏捷":"dex","知力":"int","精神":"pow"}[key]];
  if(!k)return usage("/status_up");
  const n=Math.max(1,Math.floor(Number(amount)||1));
  const cost=ENEMIES.slime.baseExp*20*n;
  if(save.gold<cost)return log(`Goldが足りません。必要: ${cost} Gold（スライム${20*n}体分）`,"error");
  save.gold-=cost;
  save.character[k]=Math.min(STAT_MAX, (Number(save.character[k])||0)+n);
  save.characters=save.characters.map(x=>x.id===save.character.id?save.character:x);
  persist();
  log(`💰 ${cost} Goldを使用して${jp[k]}を+${n}しました！`,"success");
}

const WEAPON_NAMES_BY_STAR={
  1:["鉄の剣","旅人の短剣","粗末な槍"],
  2:["鋼鉄の剣","狩人の弓","兵士の槍"],
  3:["騎士の剣","月影の刃","紅蓮の大剣"],
  4:["魔銀の剣","雷鳴槍","白銀の弓"],
  5:["黒曜の斧","竜牙の槍","天翔の双剣","メイス"],
  6:["深淵の鎌","聖騎士の剣","冥王の大鎌"],
  7:["神域の杖","星輝の剣","古竜の大剣"],
  8:["天界の弓","虚空の杖","世界樹の槍"],
  9:["終焉の魔剣","神殺しの剣","混沌の鎌"],
  10:["創世の剣","万象を断つ聖剣","神話級・天命の剣","兵器コ・ドーラ"]
};

const ARMOR_NAMES_BY_STAR={
  1:["布の鎧","旅人の革鎧","粗末な胸当て"],
  2:["鉄の鎧","鋼鉄の胸当て","守護の鎧"],
  3:["騎士の鎧","月影のローブ","紅蓮の胸当て"],
  4:["魔銀の鎧","雷鳴の甲冑","白銀の軽鎧"],
  5:["黒曜の重装","竜鱗の鎧","天翔の羽衣","反逆者のアーマー"],
  6:["深淵の外套","聖騎士の鎧","冥王の甲冑"],
  7:["神域の法衣","星輝の鎧","古竜の鎧"],
  8:["天界の鎧","虚空の法衣","世界樹の鎧"],
  9:["終焉の鎧","神殺しの甲冑","混沌の外套"],
  10:["創世の鎧","万象を統べる鎧","神話級・天命の鎧"]
};

function getEquipmentLevel(item){

  if(!item)return 0;

  if(item.rarity==="SECRET"){
    return Math.min(
      Number(item.maxLevel)||5,
      Math.floor((Number(item.killCount)||0)/10)
    );
  }

  return Math.min(
    5,
    Math.floor((Number(item.killCount)||0)/10)
  );
}

function getEquipmentBonus(item){
  if(!item)return 0;
  const extra=Number(item.bonusExtra)||0;
  if(item.rarity==="SECRET"){
    const level=getEquipmentLevel(item);
    const base=Number(item.bonus)||0;
    return Math.floor(base*Math.pow(1.1,level))+extra;
  }
  return getEquipmentLevel(item)*Number(item.stars||0)+extra;
}

function getSpecialName(item){

  if(!item)return null;

  // Secret装備
  if(item.rarity==="SECRET"){

    if(getEquipmentLevel(item)>=1){

      return item.specialMagic?.name||null;
    }

    return null;
  }

  // 通常装備
  if(getEquipmentLevel(item)<5)return null;

  return EQUIPMENT_SPECIALS[item.stars]||null;
}
  function getSpecialDamage(item){

  const str =
    Number(save.character?.str) || 0;

  const damageRate =
    Number(item?.specialMagic?.damage) || 1;

  return Math.max(
    1,
    Math.floor(str * damageRate)
  );
}


function getSpecialMpCost(item){

  if(!item)return 20;

  if(item.rarity==="SECRET"){

    if(getEquipmentLevel(item)>=1){

      return Number(
        item.specialMagic?.mpCost
      )||20;
    }
  }

  return 20;
}

function itemList(){
  const inv=save.inventory||{potion:0,ether:0,items:[]};
  const eq=save.equipment||{weapon:null,armor:null};
  let lines=[
    `回復薬 ×${inv.potion||0}（戦闘中: HPが50回復）`,
    `魔力薬 ×${inv.ether||0}（戦闘中: MPが30回復）`
  ];
  if(inv.items?.length){
    lines.push(
      "装備品:",
      ...inv.items.map((x,i)=>
        `${i+1}. ${x.type==="weapon"?"武器":"防具"} ★${x.stars} ${x.name} Lv.${getEquipmentLevel(x)}/5 `+
        `${x.type==="weapon"?"攻撃補正":"防御補正"}+${getEquipmentBonus(x)} `+
        `${getSpecialName(x)?`必殺技:${getSpecialName(x)}`:""}`
      )
    );
  }else lines.push("装備品: なし");
  lines.push(`現在の武器: ${eq.weapon?`★${eq.weapon.stars} ${eq.weapon.name}（Lv.${getEquipmentLevel(eq.weapon)}/5 攻撃補正+${getEquipmentBonus(eq.weapon)}）`:"なし"}`);
  lines.push(`現在の防具: ${eq.armor?`★${eq.armor.stars} ${eq.armor.name}（Lv.${getEquipmentLevel(eq.armor)}/5 防御補正+${getEquipmentBonus(eq.armor)}）`:"なし"}`);
  log(lines.join("\n"));
}

function useItem(name){
  const c=save.character;
  if(!c)return usage("/item_use","先にキャラクターを作成してください。");

  const key=String(name||"").trim();
  const lower=key.toLowerCase();

  // 通常アイテム：回復薬
  if(lower==="potion"||key==="回復薬"){
    if(!save.battle)return usage("/item_use","回復薬は戦闘中のみ使えます。");
    if(save.inventory.potion<=0)return log("回復薬を持っていません。","error");
    if(c.hp>=c.maxHp)return log("HPが満タンです。","warn");
    save.inventory.potion--;
    c.hp=Math.min(c.maxHp,c.hp+50);
    persist();
    log("回復薬を使った！ HPが50回復。","success");
    enemyTurn();
    return;
  }

  // 通常アイテム：魔力薬
  if(lower==="ether"||key==="魔力薬"){
    if(!save.battle)return usage("/item_use","魔力薬は戦闘中のみ使えます。");
    if(save.inventory.ether<=0)return log("魔力薬を持っていません。","error");
    if(c.mp>=c.maxMp)return log("MPが満タンです。","warn");
    save.inventory.ether--;
    c.mp=Math.min(c.maxMp,c.mp+30);
    persist();
    log("魔力薬を使った！ MPが30回復。","success");
    enemyTurn();
    return;
  }

  // 装備品を消費アイテムとして使用
  const index=Number(key)-1;
  if(!Number.isInteger(index)||index<0){
    return usage("/item_use","使用するアイテム番号を指定してください。");
  }

  const item=save.inventory.items?.[index];
  if(!item)return log("その番号のアイテムはありません。","error");

  // ☆10の武器・防具だけは「装備」と「消費」の両方が可能
  if(item.rarity==="SECRET"||Number(item.stars)!==10){
    return log("消費アイテムとして使えるのは☆10の武器・防具だけです。","error");
  }

  // ☆10装備を消費したとき、現在装備中の武器・防具を強化
  if(save.equipment?.weapon) save.equipment.weapon.bonusExtra=(Number(save.equipment.weapon.bonusExtra)||0)+1;
  if(save.equipment?.armor) save.equipment.armor.bonusExtra=(Number(save.equipment.armor.bonusExtra)||0)+10;

  // 装備中の消費対象は装備から外す
  if(save.equipment?.weapon?.id===item.id)save.equipment.weapon=null;
  if(save.equipment?.armor?.id===item.id)save.equipment.armor=null;

  save.inventory.items.splice(index,1);

  // ☆10装備を消費してプレイヤーを強化
  c.maxHp+=100;
  c.hp+=100;
  c.maxMp+=50;
  c.mp+=50;

  save.characters=save.characters.map(x=>x.id===c.id?c:x);

  persist();

  log(
    `✨ ${item.name} を消費した！\n`+
    `最大HP +100\n`+
    `最大MP +50\n`+
    `HP ${c.hp}/${c.maxHp}\n`+
    `MP ${c.mp}/${c.maxMp}`,
    "success"
  );
}

function getEnemyActionNumber(enemy){
  if(!enemy||!Array.isArray(enemy.actions)||enemy.actions.length===0)return 1;
  const turn=Number(enemy.actionTurn)||0;
  return Number(enemy.actions[turn%enemy.actions.length])||1;
}

function enemyNormalAttack(enemy,character){
  const armorBonus=getEquipmentBonus(character.equipment?.armor);
  const damage=Math.max(0,rand(Math.max(1,enemy.attack-5),enemy.attack)-armorBonus);
  character.hp=Math.max(0,character.hp-damage);
  log(`${enemy.name}の通常攻撃！ ${damage}ダメージ。`);
}

function enemyAction(enemy,character){
  const actionNumber=getEnemyActionNumber(enemy);
  enemy.actionTurn=(Number(enemy.actionTurn)||0)+1;

  if(actionNumber===1){
    enemyNormalAttack(enemy,character);
    return;
  }

  const skill=enemy.skills?.[actionNumber];
  if(!skill){
    enemyNormalAttack(enemy,character);
    return;
  }

  const armorBonus=getEquipmentBonus(character.equipment?.armor);
  const damage=Math.max(0,Math.floor(enemy.attack*Number(skill.damageRate??1))-armorBonus);
  character.hp=Math.max(0,character.hp-damage);
  log(`⚡ ${enemy.name}の必殺技「${skill.name}」！ ${damage}ダメージ！`,"error");
}

function enemyTurn(){
  if(!save.battle)return;
  const e=save.battle.enemy,c=save.character;
  enemyAction(e,c);
  bossSpecialTurn(e);
  if(c.hp<=0){log("あなたは倒れた……","error");finishBattle(false);return;}
  persist();
  battleStatus();
}

function autoItem(){
  if(!save.battle)return false;
  const c=save.character;
  if(c.hp>0&&c.hp/c.maxHp<=0.25&&save.inventory.potion>0&&c.hp<c.maxHp){
    save.inventory.potion--;
    c.hp=Math.min(c.maxHp,c.hp+50);
    log("⚡ HPが25%以下になったため、回復薬を自動使用！ HPが50回復。","success");
    return true;
  }
  if(c.mp>0&&c.mp/c.maxMp<=0.15&&save.inventory.ether>0&&c.mp<c.maxMp){
    save.inventory.ether--;
    c.mp=Math.min(c.maxMp,c.mp+30);
    log("⚡ MPが15%以下になったため、魔力薬を自動使用！ MPが30回復。","success");
    return true;
  }
  return false;
}

function giveGuaranteedDrop(enemy){
  if(!enemy?.guaranteedDrop)return;
  const d=enemy.guaranteedDrop;
  const item={
    id:String(Date.now()+Math.random()),
    type:d.type,
    stars:d.stars,
    rarity:"NORMAL",
    name:d.name,
    bonus:d.bonus,
    killCount:0,
    level:0
  };
  save.inventory.items.push(item);
  log(`🎁 確定ドロップ！ ${item.name} ★${item.stars} を入手した！`,"success");
  return item;
}

function rollRareEquipment(enemy){
  const chance=Math.min(0.35,0.08+enemy.level*0.005);
  if(Math.random()>chance)return null;
  const type=Math.random()<0.5?"weapon":"armor";
  const stars=rand(1,10);
  const names=type==="weapon"?WEAPON_NAMES_BY_STAR[stars]:ARMOR_NAMES_BY_STAR[stars];
  const name=names[rand(0,names.length-1)];
  const item={
    id:String(Date.now()+Math.random()),
    type,
    stars,
    name,
    bonus:type==="weapon"?10:stars*2,
    killCount:0
  };
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
/* =========================================
   装備合成
========================================= */

function synthesizeItems(index1,index2,index3){

  const i1=Number(index1)-1;
  const i2=Number(index2)-1;
  const i3=Number(index3)-1;

  const indexes=[i1,i2,i3];

  if(indexes.some(i=>i<0)){
    return usage(
      "/synthesize",
      "3つのアイテム番号を指定してください。"
    );
  }

  if(
    new Set(indexes).size!==3
  ){

    return log(
      "同じアイテムを複数回指定することはできません。",
      "error"
    );
  }

  const items=indexes.map(
    i=>save.inventory.items?.[i]
  );

  if(items.some(x=>!x)){

    return log(
      "指定されたアイテムがありません。",
      "error"
    );
  }

  // Secretは合成素材にできない
  if(
    items.some(
      x=>x.rarity==="SECRET"
    )
  ){

    return log(
      "Secret装備は合成素材にできません。",
      "error"
    );
  }

  // 同じレアリティか確認
  const rarity=items[0].stars;

  if(
    items.some(
      x=>x.stars!==rarity
    )
  ){

    return log(
      "同じレアリティの装備3つが必要です。",
      "error"
    );
  }

  // ★10はそれ以上にできない
  if(rarity>=10){

    return log(
      "★10はこれ以上合成できません。",
      "warn"
    );
  }

  // 素材を削除
  indexes
    .sort((a,b)=>b-a)
    .forEach(
      i=>save.inventory.items.splice(i,1)
    );

  // ★5以上ならSecret判定
  if(rarity>=5){

    const secretChance=Math.min(0.15,0.03+rarity*0.012);
    if(Math.random()<secretChance){

      const secretKeys=
        Object.keys(SECRET_EQUIPMENT);

      const secretId=
        secretKeys[
          rand(0,secretKeys.length-1)
        ];

      const secret=
        SECRET_EQUIPMENT[secretId];

      const newItem={

        id:String(
          Date.now()+Math.random()
        ),

        type:secret.type,

        rarity:"SECRET",

        stars:"SECRET",

        name:secret.name,

        bonus:secret.bonus,

        killCount:0,

        level:0,

        maxLevel:secret.maxLevel,

        specialMagic:{
          ...secret.specialMagic
        }

      };

      save.inventory.items.push(
        newItem
      );

      persist();

      return log(
        `✨✨✨ SECRET合成成功！\n`+
        `${newItem.name}\n`+
        `スペシャルマジック: `+
        `${newItem.specialMagic.name}\n`+
        `Lv.${newItem.maxLevel}で解放\n`+
        `ダメージ: `+
        `${newItem.specialMagic.damage}\n`+
        `MP消費: `+
        `${newItem.specialMagic.mpCost}`,
        "success"
      );
    }
  }

  // 通常のランクアップ
  const newStars=rarity+1;

  const type=
    items[0].type;

  const names=
    type==="weapon"
      ? WEAPON_NAMES_BY_STAR[newStars]
      : ARMOR_NAMES_BY_STAR[newStars];

  const name=
    names[
      rand(0,names.length-1)
    ];

  const newItem={

    id:String(
      Date.now()+Math.random()
    ),

    type,

    rarity:"NORMAL",

    stars:newStars,

    name,

    bonus:newStars,

    killCount:0,

    level:0

  };

  save.inventory.items.push(
    newItem
  );

  persist();

  log(
    `🔨 合成成功！\n`+
    `★${rarity} × 3\n`+
    `→ ★${newStars} ${name}`,
    "success"
  );
}
function enemyStats(id,lv){
  if(BOSS_DATA[id]){
    const b=BOSS_DATA[id];
    let hp=b.hp, attack=b.attack;
    if(b.evolving){
      const evolution=Number(save.history?.filter(x=>x===`boss:${id}:defeat`).length)||0;
      hp+=evolution*500000;
      attack+=evolution*300;
    }
    return {id,name:b.name,level:b.rank||0,maxHp:hp,hp,attack,defense:b.defense,exp:0,gold:b.goldReward||0,desc:"強大なボス。",boss:true,rank:b.rank||0,secret:b.secret,evolving:b.evolving};
  }
  const b=ENEMIES[id];
  const level=Math.max(1,Number(lv)||1);
  const mult=1+(level-1)*0.18;
  return {
    ...b,
    level,
    maxHp:Math.floor(b.baseHp*mult),
    hp:Math.floor(b.baseHp*mult),
    attack:Math.floor(b.baseAttack*(1+(level-1)*0.12)),
    defense:Math.floor(b.baseDefense*(1+(level-1)*0.1)),
    exp:Math.floor(b.baseExp*(1+(level-1)*0.2)),
    gold:Math.floor(b.gold*(1+(level-1)*0.15))
  };
}

function enemyList(){
  const normal=Object.keys(ENEMIES).map(id=>`${id} → ${ENEMIES[id].name} (基礎HP ${ENEMIES[id].baseHp})`);
  const bosses=Object.keys(BOSS_DATA).map(id=>`${id} → ${BOSS_DATA[id].name} (ボスHP ${BOSS_DATA[id].hp})`);
  log(normal.concat(["", "【ボス・裏ボス】"],bosses).join("\n"));
}

function enemyInfo(id,lv){
  if(!id)return usage("/enemy_info");
  if(!ENEMIES[id]&&!BOSS_DATA[id])return log(`敵ID「${id}」がありません。\n/enemy_list で確認してください。`,"error");
  const e=enemyStats(id,lv||1);
  log(`${e.name} Lv.${e.level}\nHP ${e.hp}\n攻撃 ${e.attack}\n防御 ${e.defense}\n獲得EXP ${e.exp}\n獲得Gold ${e.gold}\n${e.desc}`);
}

function battleStart(id,lv){
  if(!id)return usage("/battle_start");
  if(!ENEMIES[id]&&!BOSS_DATA[id])return log(`敵ID「${id}」がありません。\n/enemy_list で確認してください。`,"error");
  if(!save.character)return usage("/char_create","先にキャラクターを作成してください。");
  const e=enemyStats(id,lv||1);
  save.battle={
    enemy:{...e,actionTurn:0},
    returnState:{hp:save.character.hp,mp:save.character.mp}
  };
  persist();
  log(`⚔ ${e.name} Lv.${e.level} が現れた！\nHP ${e.hp} / 攻撃 ${e.attack} / 防御 ${e.defense}`);
  battleStatus();
}

function battleStatus(){
  if(!save.battle)return usage("/battle_start","戦闘中ではありません。");
  const e=save.battle.enemy,c=save.character;
  log(`敵: ${e.name} Lv.${e.level} HP ${e.hp}/${e.maxHp}\nあなた: ${c.name} HP ${c.hp}/${c.maxHp} MP ${c.mp}/${c.maxMp}`);
}

function gainExp(n){
  const c=save.character;
  const amount=Math.max(0,Number(n)||0);
  c.exp+=amount;
  log(`EXP +${amount} (${c.exp}/${c.nextExp})`);
  while(c.exp>=c.nextExp){
    c.exp-=c.nextExp;
    c.level++;
    c.nextExp=Math.floor(c.nextExp*1.35);
    c.maxHp+=20;c.hp=c.maxHp;
    c.maxMp+=10;c.mp=c.maxMp;
    c.str=Math.min(STAT_MAX,c.str+2);c.dex=Math.min(STAT_MAX,c.dex+2);c.int=Math.min(STAT_MAX,c.int+2);c.pow=Math.min(STAT_MAX,c.pow+2);
    log(`🎉 LEVEL UP! ${c.name} は Lv.${c.level} になった！\nステータスが上昇した！`,"success");
  }
}

function increaseEquipmentKills(){
  const items=[save.equipment?.weapon,save.equipment?.armor];
  for(const item of items){
    if(!item)continue;
    item.killCount=(Number(item.killCount)||0)+1;
    const lv=getEquipmentLevel(item);
    if(item.killCount%10===0){
      log(`⚔ ${item.name} が装備Lv.${lv}/5になった！`,"success");
    }
    if(item.killCount===50){
      log(`✨ ${item.name} の必殺技「${getSpecialName(item)}」が解放された！`,"success");
    }
  }
}

function finishBattle(win){
  const b=save.battle;
  const c=save.character;
  if(!b)return;
  if(win){
    if(b.enemy.boss){
      if(b.enemy.rank) {
        for(let i=0;i<b.enemy.rank;i++) gainExp(b.enemy.nextExp||0);
        c.level+=b.enemy.rank;
        c.nextExp=Math.max(100,Math.floor(c.nextExp*1.35));
        log(`🏆 ${b.enemy.name}撃破！ レベルが${b.enemy.rank}上がった！`,"success");
      }
      save.gold+=b.enemy.gold;
      log(`💰 Gold +${b.enemy.gold}`,"success");
      save.history=save.history||[];
      save.history.push(`boss:${b.enemy.id}:defeat`);
    }else{
      giveGuaranteedDrop(b.enemy);
      gainExp(b.enemy.exp);
      save.gold+=b.enemy.gold;
      log(`💰 Gold +${b.enemy.gold}`,"success");
    }
    increaseEquipmentKills();
  }
  c.hp=c.maxHp;
  c.mp=c.maxMp;
  save.battle=null;
  save.characters=save.characters.map(x=>x.id===c.id?c:x);
  persist();
  log("戦闘終了。HPとMPが最大値まで回復しました。");
}

function bossSpecialTurn(e){
  if(!e?.boss)return;
  if(e.secret==="shine"){
    e.attack+=50;
    log(`☀ サンシャインイ・ザーキの「shine」！ 通常攻撃を行い、攻撃力が50上がった！`,"warn");
  }else if(e.secret==="がっちがちやで"){
    e.defense+=10;
    log(`🌙 月せんべいの「がっちがちやで」！ 通常攻撃を行い、防御力が10上がった！`,"warn");
  }
}

function normalDamageAgainst(e,c,weaponBonus=0){
  return Math.max(1,rand(8,18)+c.str+weaponBonus-Math.floor(e.defense*.35));
}

function attack(){
  if(!save.battle)return usage("/battle_start","戦闘中ではありません。");
  const e=save.battle.enemy,c=save.character;
  autoItem();
  const weaponBonus=getEquipmentBonus(save.equipment?.weapon);
  const d=normalDamageAgainst(e,c,weaponBonus);
  e.hp-=d;
  log(`${c.name}の攻撃！ ${d}ダメージ。`);
  enemyAction(e,c);
  bossSpecialTurn(e);
  if(e.hp<=0&&c.hp<=0){
    log("相打ち....","warn");
    return finishBattle(false);
  }
  if(e.hp<=0){
    log(`${e.name}を倒した！`,"success");
    return finishBattle(true);
  }
  if(c.hp<=0){
    log("あなたは倒れた……","error");
    return finishBattle(false);
  }
  persist();
  battleStatus();
}

function magic(name){
  if(!name)return usage("/magic_cast");
  if(!save.battle)return usage("/battle_start","戦闘中ではありません。");
  const c=save.character,e=save.battle.enemy;
  const weapon=save.equipment?.weapon;
  const specialName=getSpecialName(weapon);
const isSpecial=
  specialName &&
  name.trim()===specialName;

const mpCost=
  isSpecial
    ? getSpecialMpCost(weapon)
    : 10;
  if(c.mp<mpCost)return log(`MPが足りません。必要MP: ${mpCost}`,"error");
  c.mp-=mpCost;
  const normal=normalDamageAgainst(e,c,getEquipmentBonus(weapon));
 const d=

  isSpecial &&
  weapon?.rarity==="SECRET"

    ? getSpecialDamage(weapon)

    : isSpecial

      ? normal*3

      : Math.max(
          1,
          rand(20,35)
          +c.int
          -Math.floor(e.defense*.15)
        );
  e.hp-=d;
  log(isSpecial?`✨ 必殺技「${specialName}」発動！ ${d}ダメージ！`:`${name}！ ${d}ダメージ。`,isSpecial?"success":"system");
  enemyAction(e,c);
  bossSpecialTurn(e);
  if(e.hp<=0&&c.hp<=0){
    log("相打ち....","warn");
    return finishBattle(false);
  }
  if(e.hp<=0){
    log(`${e.name}を倒した！`,"success");
    return finishBattle(true);
  }
  if(c.hp<=0)return finishBattle(false);
  persist();
  battleStatus();
}

function run(){
  if(!save.battle)return usage("/battle_start","戦闘中ではありません。");
  if(Math.random()<.65){
    log("逃走に成功した！");
    finishBattle(false);
  }else{
    log("逃走に失敗した！","warn");
    const e=save.battle.enemy,c=save.character;
    c.hp=Math.max(0,c.hp-rand(1,e.attack));
    persist();
    battleStatus();
  }
}

function cloneForPvP(character){
  return JSON.parse(JSON.stringify(character));
}

function pvpStart(a,b){
  if(!a||!b)return usage("/pvp_start");
  const p1=save.characters.find(c=>c.name===a)||save.characters[Number(a)-1];
  const p2=save.characters.find(c=>c.name===b)||save.characters[Number(b)-1];
  if(!p1||!p2)return log("PvP参加キャラクターが見つかりません。/char_listで確認してください。","error");
  save.pvp={
    turn:1,
    current:0,
    players:[
      cloneForPvP(p1),
      cloneForPvP(p2)
    ]
  };
  save.pvp.players.forEach(p=>{
    p.hp=p.maxHp;
    p.mp=p.maxMp;
  });
  persist();
  log(`⚔ ${p1.name} vs ${p2.name} 開始！\nそれぞれのキャラクターのステータスをコピーしました。`,"success");
  pvpStatus();
}

function pvpStatus(){
  if(!save.pvp)return usage("/pvp_start","PvP中ではありません。");
  const a=save.pvp.players[0],b=save.pvp.players[1],c=save.pvp.players[save.pvp.current];
  log(`Turn ${save.pvp.turn}\n${a.name}: HP ${a.hp}/${a.maxHp} MP ${a.mp}/${a.maxMp} STR ${a.str} DEX ${a.dex} INT ${a.int} POW ${a.pow}\n${b.name}: HP ${b.hp}/${b.maxHp} MP ${b.mp}/${b.maxMp} STR ${b.str} DEX ${b.dex} INT ${b.int} POW ${b.pow}\n現在: ${c.name}`);
}

function pvpNext(){
  save.pvp.current=1-save.pvp.current;
  if(save.pvp.current===0)save.pvp.turn++;
  persist();
  pvpStatus();
}

function pvpAttack(){
  if(!save.pvp)return usage("/pvp_start","PvP中ではありません。");
  const p=save.pvp.players[save.pvp.current],t=save.pvp.players[1-save.pvp.current];
  const weapon=p.equipment?.weapon;
  const d=normalDamageAgainst({defense:0},p,getEquipmentBonus(weapon));
  t.hp-=d;
  log(`${p.name} → ${t.name}: ${d}ダメージ`);
  if(t.hp<=0){
    log(`${p.name} の勝利！`,"success");
    save.pvp=null;
    persist();
    return;
  }
  pvpNext();
}

function pvpMagic(n){
  if(!n)return usage("/pvp_magic");
  if(!save.pvp)return usage("/pvp_start","PvP中ではありません。");
  const p=save.pvp.players[save.pvp.current],t=save.pvp.players[1-save.pvp.current];
  const weapon=p.equipment?.weapon;
  const specialName=getSpecialName(weapon);
  const isSpecial=specialName&&n.trim()===specialName;
  const cost=isSpecial?20:10;
  if(p.mp<cost)return log(`MPが足りません。必要MP: ${cost}`,"error");
  p.mp-=cost;
  const normal=normalDamageAgainst({defense:0},p,getEquipmentBonus(weapon));
  const d=isSpecial?normal*3:Math.max(1,rand(18,35)+p.int);
  t.hp-=d;
  log(isSpecial?`✨ ${p.name}の必殺技「${specialName}」！ ${d}ダメージ！`:`${p.name}の${n} → ${t.name}: ${d}ダメージ`,isSpecial?"success":"system");
  if(t.hp<=0){
    log(`${p.name} の勝利！`,"success");
    save.pvp=null;
    persist();
    return;
  }
  pvpNext();
}
/* =========================================
   Firebase オンラインPvP
========================================= */

let onlineRoomCode=null;
let onlineUnsubscribe=null;
let onlineLogSeen=new Set();

/*
  オンラインPvP専用のプレイヤーID

  キャラクターIDとは別物。
  このブラウザのプレイヤーを識別する。
*/
let onlinePlayerId =
  sessionStorage.getItem("onlinePlayerId");

if(!onlinePlayerId){

  onlinePlayerId =
    crypto.randomUUID();

  sessionStorage.setItem(
    "onlinePlayerId",
    onlinePlayerId
  );

}

function makeRoomCode(){
  return Math.random().toString(36).substring(2,8).toUpperCase();
}

function onlineCharacter(){
  if(!save.character){
    log("先にキャラクターを作成してください。","error");
    return null;
  }

  const c=cloneForPvP(save.character);

  c.hp=c.maxHp;
  c.mp=c.maxMp;

  return {
    id:c.id,
    name:c.name,
    level:c.level,
    exp:c.exp,
    maxHp:c.maxHp,
    hp:c.hp,
    maxMp:c.maxMp,
    mp:c.mp,
    str:c.str,
    dex:c.dex,
    int:c.int,
    pow:c.pow,
    equipment:c.equipment||{}
  };
}

async function onlineCreate(){

  log("オンラインPvPを開始しています……");

  if(!window.firebaseDB){
    return log("Firebaseが読み込まれていません。","error");
  }

  log("Firebase接続OK");

  const character=onlineCharacter();

  if(!character){
    return log("キャラクターがありません。","error");
  }

  log("キャラクター確認OK");

  const code=makeRoomCode();

  log("ルームコードを作成しました: "+code);

  onlineRoomCode=code;

  try{

    const roomRef=window.firebaseRef(
      window.firebaseDB,
      "onlinePvp/"+code
    );

    await window.firebaseSet(roomRef,{
      status:"waiting",
      turn:0,
      players:{
        player1:{
            ...character,
            // オンライン専用ID
            onlinePlayerId:onlinePlayerId,
            connected:true
          }
      },
      logs:{},
      createdAt:Date.now()
    });

    await onlineLog(
      roomRef,
      `${character.name} がオンラインPvPルームを作成しました。`,
      "success"
    );

    log(
      `オンラインPvPルームを作成しました！\n`+
      `ルームコード: ${code}\n\n`+
      `相手は以下を入力してください:\n`+
      `/online_join ${code}`,
      "success"
    );

    onlineListen(code);

  }catch(e){

    console.error(e);

    log(
      "オンラインPvPルームの作成に失敗しました。\n"+
      e.message,
      "error"
    );

  }

}
async function onlineJoin(code){

  if(!window.firebaseDB){
    return log(
      "Firebaseが読み込まれていません。",
      "error"
    );
  }

  if(!code){
    return usage("/online_join");
  }

  const character=onlineCharacter();

  if(!character)return;

  const roomCode=code.toUpperCase();

  const roomRef=window.firebaseRef(
    window.firebaseDB,
    "onlinePvp/"+roomCode
  );

  const snapshot=
    await window.firebaseGet(roomRef);

  if(!snapshot.exists()){
    return log(
      "そのルームは存在しません。",
      "error"
    );
  }

  const room=snapshot.val();

  // すでに戦闘中なら参加不可
  if(room.status!=="waiting"){
    return log(
      "このルームはすでに開始されています。",
      "error"
    );
  }

  // player2がすでに存在するなら満員
  if(room.players?.player2){

    return log(
      "このルームはすでに満員です。",
      "error"
    );

  }

  onlineRoomCode=roomCode;

  await window.firebaseUpdate(roomRef,{

    status:"battle",

    "players/player2":{

      ...character,

      onlinePlayerId:
        onlinePlayerId,

      connected:true

    },

    turn:0

  });

  log(

    "オンラインPvPに参加しました！\n"+
    "キャラクターのステータスをコピーしました。",

    "success"

  );

  onlineListen(onlineRoomCode);

  await onlineLog(
    roomRef,
    `${character.name} がオンラインPvPに参加しました！`,
    "success"
  );

}

function onlineLog(roomRef,message,type="system"){
  const id=Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  const key=`logs/${id}`;
  return window.firebaseUpdate(roomRef,{
    [key]:{
      message:String(message),
      type,
      createdAt:Date.now()
    }
  });
}

function onlineRenderLogs(room){
  const logs=room.logs||{};
  Object.entries(logs)
    .sort((a,b)=>(a[1].createdAt||0)-(b[1].createdAt||0))
    .forEach(([id,item])=>{
      if(onlineLogSeen.has(id))return;
      onlineLogSeen.add(id);
      log(item.message,item.type||"system");
    });
}

function onlineHpGauge(hp,maxHp){
  const total=20;
  const ratio=maxHp>0?Math.max(0,Math.min(1,hp/maxHp)):0;
  const filled=Math.round(ratio*total);
  return "■".repeat(filled)+"□".repeat(total-filled);
}

let onlineLastStatusKey="";

function onlineStatusKey(room){
  const p1=room.players?.player1;
  const p2=room.players?.player2;
  return [room.status,room.turn,p1?.hp,p1?.mp,p2?.hp,p2?.mp].join("|");
}

function onlineListen(code){

  if(onlineUnsubscribe){
    onlineUnsubscribe();
  }

  onlineLogSeen=new Set();
  onlineLastStatusKey="";

  const roomRef=window.firebaseRef(
    window.firebaseDB,
    "onlinePvp/"+code
  );

  onlineUnsubscribe=window.firebaseOnValue(
    roomRef,
    snapshot=>{

      if(!snapshot.exists()){
        log("オンラインPvPルームが終了しました。","warn");
        return;
      }

      const room=snapshot.val();
      onlineRenderLogs(room);

      if(room.status==="battle"){
        const key=onlineStatusKey(room);
        if(key!==onlineLastStatusKey){
          onlineLastStatusKey=key;
          logOnlineStatus(room);
        }
      }

      if(room.status==="finished"){
        const winnerLog=`🏆 ${room.winner} の勝利！`;
        const finishId="__finished__";
        if(!onlineLogSeen.has(finishId)){
          onlineLogSeen.add(finishId);
          log(winnerLog,"success");
        }
      }
    }
  );
}

function getOnlinePlayer(room){

  const myOnlineId=onlinePlayerId;

  if(
    room.players?.player1?.onlinePlayerId
    === myOnlineId
  ){

    return ["player1","player2"];
  }

  if(
    room.players?.player2?.onlinePlayerId
    === myOnlineId
  ){

    return ["player2","player1"];
  }

  return null;
}

function logOnlineStatus(room){

  const p1=room.players?.player1;
  const p2=room.players?.player2;

  if(!p1||!p2){
    log("相手の参加を待っています……");
    return;
  }

  log(
    `【オンラインPvP】\n`+
    `${p1.name}: ${onlineHpGauge(p1.hp,p1.maxHp)}\n`+
    `${p2.name}: ${onlineHpGauge(p2.hp,p2.maxHp)}\n`+
    `現在のターン: ${room.turn===0?p1.name:p2.name}`
  );
}

async function onlineAttack(){

  if(!onlineRoomCode){
    return log("オンラインPvP中ではありません。","error");
  }

  const roomRef=window.firebaseRef(
    window.firebaseDB,
    "onlinePvp/"+onlineRoomCode
  );

  const snapshot=await window.firebaseGet(roomRef);

  if(!snapshot.exists())return;

  const room=snapshot.val();
  if(room.status!=="battle")return log("現在、戦闘中ではありません。","warn");

  const ids=getOnlinePlayer(room);

  if(!ids){
    return log("自分のキャラクターが見つかりません。","error");
  }

  const [meId,enemyId]=ids;

  const myTurn=
    (room.turn===0&&meId==="player1")||
    (room.turn===1&&meId==="player2");

  if(!myTurn){
    return log("相手のターンです。","warn");
  }

  const me=room.players[meId];
  const enemy=room.players[enemyId];
  const weaponBonus =
  getEquipmentBonus(me.equipment?.weapon);

const armorBonus =
  getEquipmentBonus(enemy.equipment?.armor);

const damage =
  Math.max(
    1,
    normalDamageAgainst(
      {defense:armorBonus},
      me,
      weaponBonus
    )
  );
  const newHp=Math.max(0,enemy.hp-damage);

  const updates={};
  updates[`players/${enemyId}/hp`]=newHp;

  if(newHp<=0){
    updates.status="finished";
    updates.winner=me.name;
  }else{
    updates.turn=room.turn===0?1:0;
  }

  await window.firebaseUpdate(roomRef,updates);
  await onlineLog(
    roomRef,
    `${me.name}の攻撃！ ${damage}ダメージ。`,
    "system"
  );
}

async function onlineMagic(name){

  if(!name){
    return usage("/online_magic");
  }

  if(!onlineRoomCode){
    return log(
      "オンラインPvP中ではありません。",
      "error"
    );
  }

  const roomRef=window.firebaseRef(
    window.firebaseDB,
    "onlinePvp/"+onlineRoomCode
  );

  const snapshot=
    await window.firebaseGet(roomRef);

  if(!snapshot.exists())return;

  const room=snapshot.val();

  if(room.status!=="battle"){
    return log(
      "現在、戦闘中ではありません。",
      "warn"
    );
  }

  const ids=getOnlinePlayer(room);

  if(!ids)return;

  const [meId,enemyId]=ids;

  const myTurn=
    (room.turn===0&&meId==="player1")||
    (room.turn===1&&meId==="player2");

  if(!myTurn){
    return log(
      "相手のターンです。",
      "warn"
    );
  }

  const me=room.players[meId];
  const enemy=room.players[enemyId];

  const weapon=me.equipment?.weapon;

  const special=
    getSpecialName(weapon);

  const isSpecial=
    special &&
    name.trim()===special;

  const cost=
    isSpecial
      ? getSpecialMpCost(weapon)
      : 10;

  if(me.mp<cost){
    return log(
      `MPが足りません。必要MP: ${cost}`,
      "error"
    );
  }

  const armorBonus=
    getEquipmentBonus(
      enemy.equipment?.armor
    );

  let damage;

  if(isSpecial){

    if(weapon?.rarity==="SECRET"){

      damage=Math.max(
        1,
        getSpecialDamage(weapon)
        -Math.floor(armorBonus*0.15)
      );

    }else{

      damage=Math.max(
        1,
        normalDamageAgainst(
          {defense:armorBonus},
          me,
          getEquipmentBonus(weapon)
        )*3
      );

    }

  }else{

    damage=Math.max(
      1,
      rand(18,35)
      +me.int
      -Math.floor(armorBonus*0.15)
    );

  }

  const newHp=
    Math.max(
      0,
      enemy.hp-damage
    );

  const newMp=
    me.mp-cost;

  const updates={};

  updates[`players/${meId}/mp`]=newMp;
  updates[`players/${enemyId}/hp`]=newHp;

  if(newHp<=0){

    updates.status="finished";
    updates.winner=me.name;

  }else{

    updates.turn=
      room.turn===0
        ? 1
        : 0;

  }

  await window.firebaseUpdate(
    roomRef,
    updates
  );

  await onlineLog(
    roomRef,
    isSpecial
      ? `✨ ${me.name}の必殺技「${special}」！ ${damage}ダメージ！`
      : `${me.name}の${name}！ ${damage}ダメージ！`,
    "success"
  );

}

async function onlineStatus(){

  if(!onlineRoomCode){
    return log("オンラインPvP中ではありません。","error");
  }

  const roomRef=window.firebaseRef(
    window.firebaseDB,
    "onlinePvp/"+onlineRoomCode
  );

  const snapshot=await window.firebaseGet(roomRef);

  if(snapshot.exists()){
    const room=snapshot.val();
    const key=onlineStatusKey(room);
    if(key!==onlineLastStatusKey){
      onlineLastStatusKey=key;
      logOnlineStatus(room);
    }
  }
}

async function onlineEnd(){

  if(!onlineRoomCode){
    return log("オンラインPvP中ではありません。","error");
  }

  const roomRef=window.firebaseRef(
    window.firebaseDB,
    "onlinePvp/"+onlineRoomCode
  );

  await onlineLog(roomRef,"オンラインPvPを終了しました。","warn");
  await window.firebaseRemove(roomRef);

  onlineRoomCode=null;
  onlineLogSeen=new Set();

  if(onlineUnsubscribe){
    onlineUnsubscribe();
    onlineUnsubscribe=null;
  }

  log("オンラインPvPを終了しました。");
}
function help(){
  log(
    "【キャラクター】\n"+
    COMMANDS.filter(c=>["/char_create","/char_list","/char_show","/char_use","/char_delete","/char_reset","/status","/status_reroll","/status_up"].includes(c[0])).map(c=>`${c[0]} ${c[2]} | ${c[3]}`).join("\n")+
    "\n\n【アイテム・装備】\n"+
    "/item_list アイテム一覧を表示。表示された番号で装備できます。\n"+
    "/equip weapon 番号 武器を装備（例: /equip weapon 1）\n"+
    "/equip armor 番号 防具を装備（例: /equip armor 2）\n"+
    "/item_use potion|ether 戦闘中にアイテム使用\n"+
    "☆10の武器・防具は装備でき、/item_use 番号で消費すると最大HP+100・最大MP+50。装備中の武器補正+1、防具補正+10。\n"+
    "\n【武器・防具の成長】\n"+
    "装備中の武器・防具は敵を倒すたびに撃破数+1。\n"+
    "10体撃破ごとに装備Lv+1、最大Lv.5（50体）です。\n"+
    "補正値は「★の数×装備Lv」です。\n"+
    "例：★3・Lv.5 → 補正+15 / ★10・Lv.5 → 補正+50。\n"+
    "\n【必殺技】\n"+
    "通常装備はLv.5で必殺技が解放。SECRET装備はLv.1から必殺技が使用可能で、レベルは無制限。レベルごとに必殺技威力と補正が1.1倍。\n"+
    "/magic_cast 必殺技名 で発動。通常攻撃の3倍ダメージ、MP20消費。\n"+
    "★1 ブレイクスラッシュ\n"+
    "★2 ツインエッジ\n"+
    "★3 フレイムバースト\n"+
    "★4 ブリザードエッジ\n"+
    "★5 サンダーブレイカー\n"+
    "★6 ダークネスブレード\n"+
    "★7 テンペストスラッシュ\n"+
    "★8 メテオクラッシュ\n"+
    "★9 ディメンションブレイク\n"+
    "★10 ラグナロク\n"+
    "\n【敵・戦闘】\n"+
    COMMANDS.filter(c=>["/enemy_list","/enemy_info","/battle_start","/battle_status","/battle_attack","/magic_cast","/battle_run"].includes(c[0])).map(c=>`${c[0]} ${c[2]} | ${c[3]}`).join("\n")+
    "\n\n【PvP】\n"+
    "PvP開始時にそれぞれのキャラクターのステータスをコピーします。\n"+
    "PvP中のHP・MP・装備状態の変化は元のキャラクターに影響しません。\n"+
    COMMANDS.filter(c=>c[0].startsWith("/pvp_")).map(c=>`${c[0]} ${c[2]} | ${c[3]}`).join("\n")+
    "\n\n【その他】\n"+
    COMMANDS.filter(c=>["/save","/load","/clear"].includes(c[0])).map(c=>`${c[0]} ${c[2]} | ${c[3]}`).join("\n")
  );
}

function execute(raw){
  const p=raw.trim().split(/\s+/);
  const input=p.shift()?.toLowerCase();
  if(!input)return;
  log("> "+raw,"user");
  const c=COMMANDS.find(x=>x[0]===input||x[1].includes(input));
  const cmd=c?.[0]||input;
  switch(cmd){
    case"/char_create":return create(p.join(" "));
    case"/char_list":return listChars();
    case"/char_show":return show();
    case"/char_use":return useChar(p.join(" "));
    case"/char_delete":return deleteChar(p.join(" "));
    case"/char_reset":return reset();
    case"/status":return status();
    case"/status_reroll":return statusReroll();
    case"/status_up":return statusUp(p[0],p[1]||1);
    case"/item_list":return itemList();
    case"/item_use":return useItem(p[0]);
    case"/equip":return equipItem(p[1]||p[0]);
    case"/synthesize":
  return synthesizeItems(
    p[0],
    p[1],
    p[2]
  );
    case"/enemy_list":return enemyList();
    case"/enemy_info":return enemyInfo(p[0],p[1]);
    case"/battle_start":return battleStart(p[0],p[1]);
    case"/battle_status":return battleStatus();
    case"/battle_attack":return attack();
    case"/magic_cast":return magic(p.join(" "));
    case"/battle_run":return run();
    case"/pvp_start":return pvpStart(p[0],p.slice(1).join(" "));
    case"/pvp_attack":return pvpAttack();
    case"/pvp_magic":return pvpMagic(p.join(" "));
    case"/pvp_status":return pvpStatus();
    case"/pvp_end":
  if(!save.pvp){
    return usage("/pvp_start","PvP中ではありません。");
  }
  save.pvp=null;
  persist();
  return log("PvPを終了しました。");

case"/online_create":
  return onlineCreate();

    case"/online_join":
      return onlineJoin(p[0]);

    case"/online_status":
      return onlineStatus();

    case"/online_attack":
      return onlineAttack();

    case"/online_magic":
      return onlineMagic(p.join(" "));

    case"/online_end":
      return onlineEnd();
      if(!save.pvp)return usage("/pvp_start","PvP中ではありません。");
      save.pvp=null;
      persist();
      return log("PvPを終了しました。");
    case"/save":persist();return log("保存しました。","success");
    case"/load":save=load();render();return log("読み込みました。","success");
    case"/clear":$("#output").innerHTML="";return;
    case"/help":return help();
    default:return log(`不明なコマンド: ${input}\n/help で一覧を表示できます。`,"error");
  }
}

let selected=0;

function update(){
  const v=$("#command-input").value.trim().toLowerCase();
  const box=$("#suggestions");
  if(!v.startsWith("/")){
    box.classList.add("hidden");
    return;
  }
  const m=COMMANDS.filter(c=>c[0].startsWith(v)||c[1].some(a=>a.startsWith(v)));
  if(!m.length){
    box.classList.add("hidden");
    return;
  }
  selected=Math.min(selected,m.length-1);
  box.innerHTML=m.map((c,i)=>`<div class="suggestion ${i===selected?"selected":""}" data-c="${c[0]}"><b>${c[0]}</b> ${c[2]}</div>`).join("");
  box.classList.remove("hidden");
  box.querySelectorAll(".suggestion").forEach(x=>x.addEventListener("mousedown",e=>{
    e.preventDefault();
    $("#command-input").value=x.dataset.c+" ";
    $("#command-input").focus();
    update();
  }));
}

$("#command-input").addEventListener("input",()=>{
  selected=0;
  update();
});

$("#command-input").addEventListener("keydown",e=>{
  const v=e.currentTarget.value.trim().toLowerCase();
  const m=COMMANDS.filter(c=>c[0].startsWith(v)||c[1].some(a=>a.startsWith(v)));
  if(e.key==="ArrowDown"&&m.length){
    e.preventDefault();
    selected=(selected+1)%m.length;
    update();
  }
  if(e.key==="ArrowUp"&&m.length){
    e.preventDefault();
    selected=(selected-1+m.length)%m.length;
    update();
  }
  if(e.key==="Tab"&&m.length){
    e.preventDefault();
    e.currentTarget.value=m[selected][0]+" ";
    update();
  }
  if(e.key==="Escape")$("#suggestions").classList.add("hidden");
});

$("#command-form").addEventListener("submit",e=>{
  e.preventDefault();
  const i=$("#command-input");
  execute(i.value);
  i.value="";
  update();
});

render();

})();
