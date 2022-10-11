// Copyright 2022 LiYechao
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { createAvatar } from '@dicebear/avatars'
import * as style from '@dicebear/pixel-art'
import styled from '@emotion/styled'
import { useEffect, useState } from 'react'

export default function Avatar({ className, userId }: { className?: string; userId: string }) {
  const [avatar, setAvatar] = useState<string>()

  useEffect(() => {
    setAvatar(createAvatar(style, { seed: userId, dataUri: true }))
  }, [userId])

  return <_Img className={className} src={avatar} />
}

const _Img = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
`
