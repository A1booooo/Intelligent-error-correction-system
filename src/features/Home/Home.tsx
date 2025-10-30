import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Upload,
  List,
  Brain,
  Target,
  Lightbulb,
  Clock,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
      {/* 学习概况 */}
      <section>
        <h2 className="text-lg font-semibold mb-4">学习概况</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Brain className="size-5" />
                <span className="text-sm">总错题数</span>
              </div>
              <div className="text-4xl font-bold">1</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <RefreshCw className="size-5" />
                <span className="text-sm">复习巩固率</span>
              </div>
              <div className="text-4xl font-bold">100%</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Target className="size-5" />
                <span className="text-sm">易错知识点</span>
              </div>
              <div className="text-4xl font-bold">2</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="size-5" />
                <span className="text-sm">本周学习时长</span>
              </div>
              <div className="text-4xl font-bold">3h</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 智能推荐和AI学习建议 */}
      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-4">智能推荐</h2>
          <div className="space-y-3">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <RefreshCw className="size-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">待复习章节</div>
                    <div className="text-sm text-muted-foreground">
                      需看前上次第3题一练的题目
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Lightbulb className="size-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">易错知识点</div>
                    <div className="text-sm text-muted-foreground">
                      需要加强练习的知识点
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">AI学习建议</h2>
          <div className="space-y-3">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <TrendingUp className="size-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">一元二次函数</div>
                    <div className="text-sm text-muted-foreground">
                      你最近在此知识点失误率增长中需复习
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <TrendingUp className="size-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">圆锥曲线</div>
                    <div className="text-sm text-muted-foreground">
                      这一周上有7项错题和重难题分类
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 快捷入口和近期学习动画 */}
      <section className="grid gap-4 md:grid-cols-[300px_1fr]">
        <div>
          <h2 className="text-lg font-semibold mb-4">快捷入口</h2>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Upload className="size-5 text-primary" />
                  </div>
                  <span className="font-medium">上传错题</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="size-5 text-primary" />
                  </div>
                  <span className="font-medium">我的错题</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <List className="size-5 text-primary" />
                  </div>
                  <span className="font-medium">知识点库</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">近期学习动画</h2>
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">最近1-5题组错题数</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    480
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm">本周新增7项错题</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    520
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                最近5周的数据趋势，一元二次函数，预期在接接给我重点复习
              </div>
              {/* 简易的图表占位符 */}
              <div className="h-[200px] bg-muted/30 rounded-lg flex items-end justify-around gap-2 p-4">
                {[40, 35, 50, 45, 55, 48, 52].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-blue-500/50 rounded-t transition-all hover:bg-blue-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {index + 1}周
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
