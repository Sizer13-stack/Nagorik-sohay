-- OPTIONAL: sample reports so the dashboard is not empty in a demo. They are flagged is_mock=true and shown as "Sample report".
insert into reports(id,cat,descr,ward,status,priority,is_mock,created_at) values
('CS-10001','drain','ড্রেন বন্ধ, বৃষ্টিতে পানি জমে',2,'progress','high',true,now()-interval '2 days'),
('CS-10002','road','মূল সড়কে বড় গর্ত',1,'review','high',true,now()-interval '1 day'),
('CS-10003','light','তিনটি স্ট্রিটলাইট জ্বলছে না',3,'received','medium',true,now()-interval '3 days'),
('CS-10004','waste','ময়লা কয়েক দিন তোলা হয়নি',2,'received','medium',true,now()-interval '1 day'),
('CS-10005','water','পানির চাপ খুব কম',5,'done','low',true,now()-interval '6 days'),
('CS-10006','drain','নালার ঢাকনা ভাঙা',1,'received','high',true,now()-interval '4 days'),
('CS-10007','road','রাস্তার পাশে ভাঙা অংশ',4,'review','medium',true,now()-interval '2 days')
on conflict (id) do nothing;
insert into report_events(report_id,status,note,at)
select id,'received','rec',created_at from reports where is_mock;
insert into report_events(report_id,status,note,at)
select id,status,'upd',created_at+interval '6 hours' from reports where is_mock and status<>'received';
