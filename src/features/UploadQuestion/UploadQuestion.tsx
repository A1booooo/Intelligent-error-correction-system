import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  CloudUpload,
  PencilLine,
  Lightbulb,
  Redo2,
  BotMessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export default function UploadQuestionPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('请选择文件！');
      return;
    }

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    let fileType = '';
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') fileType = 'image';
    else if (ext === 'pdf') fileType = 'pdf';
    else if (ext === 'doc' || ext === 'docx') fileType = 'word';
    else {
      alert('文件类型不支持！');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', fileType);

    try {
      /* const res = await axios.post('http://localhost:3000/upload', formData); */
      navigate('/upload-question/question-detail', {
        state: { file: selectedFile },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-background p-6 h-[93svh] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
        <div className="lg:col-span-7 gap-4 flex flex-col">
          <h2 className="text-3xl font-semibold mb-0">智能错题</h2>
          <p className="text-middle text-muted-foreground mb-0">
            上传错题图片，系统将自动分析错题
          </p>

          <div className="flex-1 flex flex-col gap-4">
            {/* 上传区域 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3 p-8">
                <CloudUpload
                  className={`w-16 h-16 ${
                    isDragging ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <div className="text-center">
                  <p className="text-lg font-medium">
                    {selectedFile ? selectedFile.name : '点击或拖拽文件上传'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    支持 jpg、word、pdf 格式
                  </p>
                </div>
              </div>

              {/* 隐藏 input */}
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"
              />
            </div>

            <Button className="cursor-pointer" onClick={handleFileUpload}>
              确认
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="h-full bg-muted rounded-lg ml-4 border-2 border-muted-foreground/25 p-6">
            <h2 className="text-xl font-semibold m-4 pb-3 border-b">
              功能介绍
            </h2>
            <div className="space-y-3 px-3">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-center">
                    <PencilLine className="size-6 text-primary mr-3" />
                    <div className="text-lg font-medium mb-1">自动解析</div>
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    AI自动识别题目信息
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-center">
                    <Lightbulb className="size-6 text-primary mr-3" />
                    <div className="text-lg font-medium mb-1">知识点链接</div>
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    智能匹配知识点和讲解
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-center">
                    <Redo2 className="size-6 text-primary mr-3" />
                    <div className="text-lg font-medium mb-1">试题再练</div>
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    生成相似题以巩固知识点
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-center">
                    <BotMessageSquare className="size-6 text-primary mr-3" />
                    <div className="text-lg font-medium mb-1">AI问答</div>
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    与AI实时问答解决问题
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
