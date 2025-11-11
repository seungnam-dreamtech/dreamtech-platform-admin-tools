// ModifyRequestBody / ModifyResponseBody Filter 폼 컴포넌트 (공통)
import React from 'react';
import {
  TextField,
  Stack,
  Box,
  Typography,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import type {
  ActuatorModifyRequestBodyFilterArgs,
  ActuatorModifyResponseBodyFilterArgs
} from '../../../../types/gateway';

type ModifyBodyFilterArgs =
  | ActuatorModifyRequestBodyFilterArgs
  | ActuatorModifyResponseBodyFilterArgs;

interface ModifyBodyFilterFormProps {
  value: ModifyBodyFilterArgs;
  onChange: (value: ModifyBodyFilterArgs) => void;
  type: 'request' | 'response';
}

export const ModifyBodyFilterForm: React.FC<ModifyBodyFilterFormProps> = ({
  value,
  onChange,
  type
}) => {
  const isRequest = type === 'request';
  const title = isRequest ? 'ModifyRequestBody' : 'ModifyResponseBody';

  const handleContentTypeChange = (event: SelectChangeEvent) => {
    onChange({ ...value, contentType: event.target.value });
  };

  return (
    <Stack spacing={2}>
      <Alert
        severity="warning"
        icon={<InfoIcon />}
      >
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
          {title} Filter - 고급 기능
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          이 필터는 {isRequest ? '요청' : '응답'} 본문을 프로그래밍 방식으로 수정합니다.
        </Typography>
        <Typography variant="body2">
          실제 구현은 Java 코드로 작성된 RewriteFunction Bean이 필요합니다.
        </Typography>
      </Alert>

      {/* RewriteFunction Bean Name */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          RewriteFunction Bean 이름
          <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
        </Typography>
        <TextField
          value={value.rewriteFunction || ''}
          onChange={(e) => onChange({ ...value, rewriteFunction: e.target.value })}
          placeholder="예: myBodyRewriteFunction"
          fullWidth
          size="small"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 Spring Bean으로 등록된 RewriteFunction의 이름
        </Typography>
      </Box>

      {/* Content Type (선택) */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          Content Type (선택사항)
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Content-Type 선택</InputLabel>
          <Select
            value={value.contentType || ''}
            onChange={handleContentTypeChange}
            label="Content-Type 선택"
          >
            <MenuItem value="">선택 안 함</MenuItem>
            <MenuItem value="application/json">application/json</MenuItem>
            <MenuItem value="application/xml">application/xml</MenuItem>
            <MenuItem value="text/plain">text/plain</MenuItem>
            <MenuItem value="text/html">text/html</MenuItem>
            <MenuItem value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 변환 후 설정할 Content-Type (비워두면 원본 유지)
        </Typography>
      </Box>

      {/* 설명 */}
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          설명 (메모)
        </Typography>
        <TextField
          value={value.description || ''}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          placeholder="이 필터의 용도를 간단히 설명하세요"
          multiline
          rows={2}
          fullWidth
          size="small"
        />
      </Box>

      <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold">{title} 구현 예시:</Typography>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1.5 }}>
            <Chip label="Java Bean 구현 필요" size="small" color="primary" />
            <Box component="pre" sx={{
              bgcolor: 'white',
              p: 1,
              borderRadius: 1,
              fontSize: '0.75rem',
              mt: 0.5,
              overflow: 'auto',
              fontFamily: 'monospace'
            }}>
{`@Bean
public RewriteFunction<String, String> myBodyRewriteFunction() {
    return (exchange, body) -> {
        // ${isRequest ? '요청' : '응답'} 본문 변환 로직
        String modified = body.replace("old", "new");
        return Mono.just(modified);
    };
}`}
            </Box>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Chip label="사용 사례" size="small" color="success" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
              • 민감 정보 마스킹 (신용카드 번호, 주민번호 등)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              • 데이터 형식 변환 (XML ↔ JSON)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              • 필드 추가/제거/수정
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              • 암호화/복호화
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          💡 성능에 영향을 줄 수 있으므로 꼭 필요한 경우에만 사용하세요
        </Typography>
      </Box>
    </Stack>
  );
};
