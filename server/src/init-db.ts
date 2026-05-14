import db from './db.js';

/** 初始化默认数据（仅首次运行） */
export async function initDefaultData(): Promise<void> {
  const categoryCount = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as any).count;
  if (categoryCount > 0) return; // 已有数据，跳过

  console.log('📦 初始化默认数据...');

  // 创建默认分类
  db.prepare('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)').run('热菜', '🍲', 1);
  db.prepare('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)').run('凉菜', '🥗', 2);
  db.prepare('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)').run('主食', '🍚', 3);
  db.prepare('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)').run('汤品', '🍜', 4);
  db.prepare('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)').run('饮品', '🥤', 5);
  db.prepare('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)').run('甜品', '🍰', 6);

  // 创建默认菜品
  const dishes = [
    { cat: 1, name: '红烧肉', price: 38, desc: '肥而不腻，入口即化' },
    { cat: 1, name: '宫保鸡丁', price: 28, desc: '经典川菜，麻辣鲜香' },
    { cat: 1, name: '鱼香肉丝', price: 26, desc: '酸甜可口' },
    { cat: 1, name: '糖醋排骨', price: 36, desc: '外酥里嫩' },
    { cat: 1, name: '麻婆豆腐', price: 18, desc: '麻辣下饭' },
    { cat: 2, name: '凉拌黄瓜', price: 12, desc: '清爽可口' },
    { cat: 2, name: '口水鸡', price: 22, desc: '麻辣鲜香' },
    { cat: 2, name: '皮蛋豆腐', price: 16, desc: '经典凉菜' },
    { cat: 3, name: '米饭', price: 3, desc: '东北大米' },
    { cat: 3, name: '馒头', price: 2, desc: '手工馒头' },
    { cat: 3, name: '炒面', price: 15, desc: '鸡蛋炒面' },
    { cat: 4, name: '紫菜蛋花汤', price: 10, desc: '清淡鲜美' },
    { cat: 4, name: '西红柿蛋汤', price: 12, desc: '酸甜开胃' },
    { cat: 5, name: '可乐', price: 5, desc: '冰镇可乐' },
    { cat: 5, name: '雪碧', price: 5, desc: '冰镇雪碧' },
    { cat: 5, name: '矿泉水', price: 3, desc: '' },
    { cat: 6, name: '芒果布丁', price: 8, desc: '香甜滑嫩' },
    { cat: 6, name: '提拉米苏', price: 12, desc: '经典意式甜品' },
  ];

  const insertDish = db.prepare(
    'INSERT INTO dishes (category_id, name, price, description, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  dishes.forEach((d, i) => {
    insertDish.run(d.cat, d.name, d.price, d.desc, (i + 1) * 10);
  });

  // 创建默认管理员（用于管理后台登录）
  db.prepare(
    'INSERT INTO members (openid, nickname, role, family_code) VALUES (?, ?, ?, ?)'
  ).run('admin_master', '管理员', 'admin', 'family001');

  // 创建默认大厨
  db.prepare(
    'INSERT INTO members (openid, nickname, role, family_code) VALUES (?, ?, ?, ?)'
  ).run('chef_master', '张大厨', 'chef', 'family001');

  // 创建家庭配置
  const familyCount = (db.prepare('SELECT COUNT(*) as count FROM family_config').get() as any).count;
  if (familyCount === 0) {
    db.prepare(
      'INSERT INTO family_config (family_code, family_name) VALUES (?, ?)'
    ).run('family001', '幸福之家');
  }

  console.log('✅ 默认数据初始化完成！');
  console.log(`   🏠 家庭码: family001`);
  console.log(`   👤 管理员: 管理员 (密码: 无需密码，直接登录)`);
  console.log(`   👨‍🍳 大厨: 张大厨`);
  console.log(`   📦 菜品: ${dishes.length} 道`);
}
