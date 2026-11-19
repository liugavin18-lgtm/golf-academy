import copy
from curriculum_a import LEVEL1, LEVEL2, LEVEL3
from curriculum_b import LEVEL4, LEVEL5
from curriculum_c import LEVEL6, LEVEL7
from curriculum_d1 import NEW1, NEW3
from curriculum_d2 import NEW4, NEW5, NEW6, NEW7

LEVELS = copy.deepcopy([LEVEL1, LEVEL2, LEVEL3, LEVEL4, LEVEL5, LEVEL6, LEVEL7])

def insert_after(items):
    for after, lesson in items:
        for lv in LEVELS:
            ids = [l["id"] for l in lv["lessons"]]
            if after in ids:
                lv["lessons"].insert(ids.index(after) + 1, lesson); break
        else:
            raise KeyError("找不到要插在其后的课程：" + after)

for group in (NEW1, NEW3, NEW4, NEW5, NEW6, NEW7):
    insert_after(group)
